import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block from "./block.js"
import BlockDef from "./blockdef.js"
import Texture from "./texture.js"
import World from "./world.js"
import Player from "./player.js"
import ItemDef from "./itemdef.js"
import Sound from "./sound.js";
import MenuState from "./menustate.js";
import { MathUtils } from "./math.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

const textures: Map<String, Texture> = new Map()
export const blockdefs = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs  = await loadDefs<ItemDef>("items.yson", ItemDef)
let world = new World([-20, 20, -20, 20, -1, 1])
const blockSize = 80
const cam = [8, 5, 0]
export const mouse = [0, 0]
export let mouseDown = false;
const game: HTMLCanvasElement = $("#game") as HTMLCanvasElement;
const player = new Player("jens")
let menu: MenuState = MenuState.MENU;
const music = new Sound("assets/tiny/BlueMin.ogg");
let musicPlaying = false;

setInterval(() => requestAnimationFrame(draw), 100)

async function loadDefs<T>(path: string, cls: any): Promise<Map<String, T>> {
	let data = await YSON.load(path)
	let defs = new Map<String, T>()
	let namespaces = Object.keys(data)

	for (let ns of namespaces) {
		let ids = Object.keys(data[ns])

		for (let id of ids) {
			defs.set(`${ns}:${id}`, new cls(ns, id, data[ns][id]))
		}
	}
	return defs
}

export function getTexture(path: string) {
	let texture = textures.get(path)
	if (texture) {
		if (texture.state != Texture.FAILED) return texture
	}
	texture = new Texture(path)
	textures.set(path, texture)
	return texture
}

function fillWorld() { // temp
	let blockArray = Array.from(blockdefs.values())
	console.log(blockArray)

	for (let z = world.minZ; z <= world.maxZ; z++) {
		for (let y = world.minY; y <= world.maxY; y++) {
			for (let x = world.minX; x <= world.maxX; x++) {

				let r = Math.floor(Math.random() * (blockArray.length + 5)) - 5
				if (r < 0) r = 0
				world.setBlock(x, y, z, new Block(blockArray[r], x, y, z))

			}
		}
	}
}

function draw() {
	game.width  = innerWidth
	game.height = innerHeight
	game.style.width  = innerWidth  + "px"
	game.style.height = innerHeight + "px"

	const ctx = game.getContext("2d") as CanvasRenderingContext2D;
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, game.width, game.height)
	ctx.imageSmoothingEnabled = false

	if(menu == MenuState.INGAME) {
		// world
		for (let z = world.minZ; z <= world.maxZ; z++) {
			for (let y = world.minY; y <= world.maxY; y++) {
				for (let x = world.minX; x <= world.maxX; x++) {

					const block = world.getBlock(x, y, z)
					if (!block || !block.def.texture || !block.def.texture?.ready()) continue

					let screenX = Math.floor((y - cam[0]) *  blockSize + game.width/2)
					let screenY = Math.floor((x - cam[1]) * -blockSize + game.height/2)
					//console.log(Number(j) - cam[0], Number(i) + cam[1])
					//ctx.fillStyle = grid[i][j].color
					//ctx.fillRect(x, y, blockSize, blockSize)
		
					ctx.drawImage(block.def.texture.img, screenX, screenY, blockSize, blockSize)
				}
			}
			if (z == 0) {
				// player
				{
					let x = Math.floor(-0.25 *  blockSize + game.width/2)
					let y = Math.floor(0.5 * -blockSize + game.height/2)
					if (player.texture.ready()) {
						ctx.drawImage(player.texture.img, x, y, blockSize*1.5, blockSize*1.5)
					}
				}
			}
		}

		// block highlight
		{
			let {x, y} = getMouseBlock()
			let x1 = Math.floor((x - cam[0]) *  blockSize + game.width/2)
			let y1 = Math.floor((y - cam[1]) * -blockSize + game.height/2)
			ctx.fillStyle = "transparent"
			ctx.strokeStyle = "white"
			ctx.lineWidth = 2
			ctx.strokeRect(x1 /*+ 0.5*/, y1 /*+ 0.5*/, blockSize /*- 1*/, blockSize /*- 1*/) // +0.5 and -1 to align the lines in the pixel grid
		}
	} else if(menu == MenuState.MENU) {
		ctx.fillStyle = "white";
		ctx.font = "50px Consolas";
		ctx.textAlign = "center";
		ctx.fillText("Tiny MC", game.width / 2, 70);

		if(MathUtils.buttonRect(ctx, game.height / 2, 150, 300, 70, "white", "gray", "red")) {
			menu = MenuState.INGAME;
			fillWorld();
			saveWorld(Math.random() + "");
		}
		ctx.fillStyle = "black";
		ctx.font = "30px Consolas"
		ctx.fillText("Create New World", game.width / 2 + 35, 150 + 50);

		const worlds = JSON.parse(localStorage.getItem("worlds") as string);
		console.log(worlds);
		if(worlds) {
			for(let i = 0; i < worlds.length; i++) {
				ctx.fillStyle = "white";
				if(MathUtils.buttonRect(ctx, game.height / 2, 200 + i * 75, 300, 70, "white", "gray", "red")) {
					menu = MenuState.INGAME;
					world = worlds[i];
				}
				ctx.fillStyle = "blue";
				ctx.font = "30px Consolas";
				ctx.fillText(Object.keys(worlds)[i], game.width / 2 + 35, 200 + 50 + i * 75);
			}
		} else {
			ctx.fillStyle = "gray";
			ctx.font = "20px Consolas";
			ctx.fillText("Saved worlds will show up here", game.width / 2, 200);
		}

		ctx.fillStyle = "blue";
	}

}

function saveWorld(name: string) {
	let worlds = JSON.parse(localStorage.getItem("worlds") as string);
	if(worlds == null) worlds = {};
	worlds[name] = world;
	localStorage.setItem("worlds", JSON.stringify(worlds));
}

function getMouseBlock() {
	return {
		x:  Math.floor((mouse[0] - game.width/2  + cam[0]*blockSize) / blockSize),
		y: -Math.floor((mouse[1] - game.height/2 - cam[1]*blockSize) / blockSize)
	}
}

window.addEventListener("keydown", e => {
	if (e.key == "w") cam[1] += 0.25;
	if (e.key == "a") cam[0] -= 0.25
	if (e.key == "s") cam[1] -= 0.25
	if (e.key == "d") cam[0] += 0.25
	if(!musicPlaying) {
		//music.audio.play();
		musicPlaying = true;
	}
})

window.addEventListener("mousemove", e => {
	mouse[0] = e.x
	mouse[1] = e.y
})

window.addEventListener("click", e => {
	let {x, y} = getMouseBlock()
	
	switch (e.button) {
		case 0:
			if(menu == MenuState.INGAME) {
				world.clearBlock(x, y, 0)
			}
			break;
	}
})

window.addEventListener("mousedown", e => {
	mouseDown = true;
})

window.addEventListener("mouseup", e => {
	mouseDown = false;
})
