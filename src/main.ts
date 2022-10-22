import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block from "./block.js"
import BlockDef from "./blockdef.js"
import Texture from "./texture.js"
import World from "./world.js"
import Player from "./player.js"
import ItemDef from "./itemdef.js"
import Hotbar from "./hotbar.js"
import WorldGenerator from "./worldgen.js"
import Cam from "./cam.js"
import Input from "./input.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

const textures: Map<String, Texture> = new Map()
export const blockdefs = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs  = await loadDefs<ItemDef>("items.yson", ItemDef)
const world = new World([-20, 20, -20, 20, -1, 1])
const blockSize = 80
const game: any = $("#game")
export const player = new Player("jens")
const cam = new Cam(player)
const input = new Input()

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

	// tick
	player.motion.x = (Number(input.pressed("KeyD")) - Number(input.pressed("KeyA"))) * 0.25
	player.motion.y = (Number(input.pressed("KeyW")) - Number(input.pressed("KeyS"))) * 0.25
	player.tick()

	// draw
	const ctx = game.getContext("2d")
	ctx.fillStyle = "#78A7FF"
	ctx.fillRect(0, 0, game.width, game.height)
	ctx.imageSmoothingEnabled = false

	// world
	for (let z = world.minZ; z <= world.maxZ; z++) {
		for (let y = world.minY; y <= world.maxY; y++) {
			for (let x = world.minX; x <= world.maxX; x++) {

				const block = world.getBlock(x, y, z)
				if (!block || !block.texture || !block.texture.ready()) continue

				let screenX = Math.floor((x - cam.x) *  blockSize + game.width/2)
				let screenY = Math.floor((y - cam.y) * -blockSize + game.height/2)
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
		let x1 = Math.floor((x - cam.x) *  blockSize + game.width/2)
		let y1 = Math.floor((y - cam.y) * -blockSize + game.height/2)
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
		x:  Math.floor((input.mouseX - game.width/2  + cam.x*blockSize) / blockSize),
		y: -Math.floor((input.mouseY - game.height/2 - cam.y*blockSize) / blockSize)
	}
}

input.on("keydown", (key: string) => {
	if (key == "Digit1") player.selectedItemSlot = 0
	if (key == "Digit2") player.selectedItemSlot = 1
	if (key == "Digit3") player.selectedItemSlot = 2
	if (key == "Digit4") player.selectedItemSlot = 3
	if (key == "Digit5") player.selectedItemSlot = 4
})

input.on("click", (button: number) => {
	let {x, y} = getMouseBlock()
	switch (button) {
		case 0:
			world.clearBlock(x, y, 0)
			break
		case 1:
			let stack = player.selectedItem
			if (world.getBlock(x, y, 0)?.id == "tiny:air" && stack.item.isBlock())
				world.setBlock(x, y, 0, new Block(stack.item.id, x, y, 0))
			break
	}
})
