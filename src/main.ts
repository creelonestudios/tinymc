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
import EntityDef from "./entitydef.js"
import ItemEntity from "./itementity.js"
import ItemStack from "./itemstack.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

const textures: Map<String, Texture> = new Map()
export const blockdefs = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs  = await loadDefs<ItemDef>("items.yson", ItemDef)
export const entitydefs  = await loadDefs<EntityDef>("entities.yson", EntityDef)
const world = new World([-20, 20, -20, 20, -1, 1])
const blockSize = 80
export const game: any = $("#game")
export const player = new Player("jens")
export const cam = new Cam(player)
const input = new Input()
export let debug = { showHitboxes: false }

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
	player.tick(world)
	world.tick()

	// draw
	const ctx: CanvasRenderingContext2D = game.getContext("2d")
	ctx.fillStyle = "#78A7FF"
	ctx.fillRect(0, 0, game.width, game.height)
	ctx.imageSmoothingEnabled = false

	// world
	for (let z = world.minZ; z <= world.maxZ; z++) {
		for (let y = world.minY; y <= world.maxY; y++) {
			for (let x = world.minX; x <= world.maxX; x++) {
				world.getBlock(x, y, z)?.draw(ctx, x, y, blockSize)
			}
		}
		if (z == 0) {
			// player
			for (let entity of world.getAllEntities()) {
				entity.draw(ctx, entity.position.x, entity.position.y, blockSize)
			}
			player.draw(ctx, player.position.x, player.position.y, blockSize)
		}
	}

	// block highlight
	{
		let {x, y} = getMouseBlock()
		let x1 = Math.floor((x  - cam.x) *  blockSize + game.width/2)
		let y1 = Math.floor((y-1 - cam.y) * -blockSize + game.height/2)
		ctx.fillStyle = "transparent"
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2
		ctx.strokeRect(x1, y1, blockSize, blockSize)
	}

	// hotbar
	{
		Hotbar.drawHotbar(player, ctx, game.width, game.height)
	}

}

function getMouseBlock() {
	return {
		x:  Math.floor((input.mouseX - game.width/2  + cam.x*blockSize) / blockSize),
		y: -Math.floor((input.mouseY - game.height/2 - cam.y*blockSize) / blockSize) +1
	}
}

input.on("keydown", (key: string) => {
	if (key == "Digit1") player.selectedItemSlot = 0
	if (key == "Digit2") player.selectedItemSlot = 1
	if (key == "Digit3") player.selectedItemSlot = 2
	if (key == "Digit4") player.selectedItemSlot = 3
	if (key == "Digit5") player.selectedItemSlot = 4
	if (key == "KeyM") debug.showHitboxes = !debug.showHitboxes
	if (key == "KeyQ") world.spawn(new ItemEntity(new ItemStack(player.selectedItem.item.id), player.position.copy()))
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
				world.setBlock(x, y, 0, new Block(stack.item.id))
			break
	}
})
