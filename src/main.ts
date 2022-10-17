import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block from "./block.js"
import BlockDef from "./blockdef.js"
import Texture from "./texture.js"
import World from "./world.js"
import Player from "./player.js"
import ItemDef from "./itemdef.js"
import Hotbar from "./hotbar.js"
import WorldGenerator from "./worldgen.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

const textures: Map<String, Texture> = new Map()
export const blockdefs = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs  = await loadDefs<ItemDef>("items.yson", ItemDef)
const world = new World([-20, 20, -20, 20, -1, 1])
const blockSize = 80
const cam = [0, 1, 0]
const mouse = [0, 0]
const game: any = $("#game")
const player = new Player("jens")

Hotbar.loadTexture()
WorldGenerator.flat(world)
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

function draw() {
	game.width  = innerWidth
	game.height = innerHeight
	game.style.width  = innerWidth  + "px"
	game.style.height = innerHeight + "px"

	const ctx = game.getContext("2d")
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, game.width, game.height)
	ctx.imageSmoothingEnabled = false

	// world
	for (let z = world.minZ; z <= world.maxZ; z++) {
		for (let y = world.minY; y <= world.maxY; y++) {
			for (let x = world.minX; x <= world.maxX; x++) {

				const block = world.getBlock(x, y, z)
				if (!block || !block.texture || !block.texture.ready()) continue

				let screenX = Math.floor((x - cam[0]) *  blockSize + game.width/2)
				let screenY = Math.floor((y - cam[1]) * -blockSize + game.height/2)
				//console.log(Number(j) - cam[0], Number(i) + cam[1])
				//ctx.fillStyle = grid[i][j].color
				//ctx.fillRect(x, y, blockSize, blockSize)
	
				ctx.drawImage(block.texture.img, screenX, screenY, blockSize, blockSize)
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

	// hotbar
	{
		Hotbar.drawHotbar(player, ctx, game.width, game.height)
	}

}

function getMouseBlock() {
	return {
		x:  Math.floor((mouse[0] - game.width/2  + cam[0]*blockSize) / blockSize),
		y: -Math.floor((mouse[1] - game.height/2 - cam[1]*blockSize) / blockSize)
	}
}

window.addEventListener("keydown", e => {
	if (e.key == "w") cam[1] += 0.25
	if (e.key == "a") cam[0] -= 0.25
	if (e.key == "s") cam[1] -= 0.25
	if (e.key == "d") cam[0] += 0.25
})

window.addEventListener("mousemove", e => {
	mouse[0] = e.x
	mouse[1] = e.y
})

window.addEventListener("click", e => {
	let {x, y} = getMouseBlock()
	switch (e.button) {
		case 0:
			world.clearBlock(x, y, 0)
	}
})
