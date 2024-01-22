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
import Dim2 from "./dim2.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

// constants
export const blockSize = 80
const gameOffset = new Dim2(0, -2)

// canvas
export const game: any = $("#game")

// assets
const textures: Map<String, Texture> = new Map()

// defs
export const blockdefs  = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs   = await loadDefs<ItemDef>("items.yson", ItemDef)
export const entitydefs = await loadDefs<EntityDef>("entities.yson", EntityDef)

// other
export const world = new World([-20, 20, -20, 20, -1, 1])
export const blockSize = 80
export const game: any = $("#game")
export const player = new Player("jens")
export const cam = new Cam(player)
export const input = new Input()
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

	ctx.translate(game.width/2, game.height/2) // center game

	ctx.save()
	ctx.scale(blockSize, blockSize) // scale to size of one block
	ctx.translate(gameOffset.x, -gameOffset.y) // move game by offset
	ctx.translate(-cam.x, cam.y) // move game into view

	// world
	world.draw(ctx)
	if (debug.showHitboxes) world.drawHitboxes(ctx)

	// block highlight
	{
		let mousePos = getMouseBlock().floor()

		ctx.save()
		ctx.translate(mousePos.x, -mousePos.y)

		ctx.fillStyle = "transparent"
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2 / blockSize
		ctx.strokeRect(0, 0, 1, 1)

		ctx.restore()
	}

	ctx.restore()

	// hotbar
	{
		Hotbar.drawHotbar(ctx)
	}

}

function getMouseBlock() {
	return new Dim2(
		 Math.floor((input.mouseX - game.width/2  + cam.x*blockSize) / blockSize) - gameOffset.x,
		-Math.floor((input.mouseY - game.height/2 - cam.y*blockSize) / blockSize) - gameOffset.y
	)
}

export function getMousePos() {
	return new Dim2(
		 (input.mouseX - game.width/2  + cam.x*blockSize) / blockSize,
		-(input.mouseY - game.height/2 - cam.y*blockSize) / blockSize +2
	)
}

input.on("keydown", (key: string) => {
	if (key == "Digit1") player.selectedItemSlot = 0
	if (key == "Digit2") player.selectedItemSlot = 1
	if (key == "Digit3") player.selectedItemSlot = 2
	if (key == "Digit4") player.selectedItemSlot = 3
	if (key == "Digit5") player.selectedItemSlot = 4
	if (key == "KeyM") debug.showHitboxes = !debug.showHitboxes
	if (key == "KeyQ") {
		let stack = player.selectedItem
		let index = player.selectedItemSlot
		if (stack.item.id == "tiny:air") return
		world.spawn(new ItemEntity(new ItemStack(stack.item.id), player.position.copy()))
		if (stack.amount > 1) stack.amount--
		else player.hotbar.set(index, new ItemStack("tiny:air"))
	}
})

input.on("click", (button: number) => {
	let {x, y} = getMouseBlock()
	//console.log(button)
	switch (button) {
		case 0:
			world.clearBlock(x, y, 0)
			break
		case 1:
			let block = world.getBlock(x, y, 0)
			if (!block || block.id == "tiny:air") break
			player.pickBlock(block)
			break
		case 2:
			let stack = player.selectedItem
			if (world.getBlock(x, y, 0)?.id == "tiny:air" && stack.item.isBlock())
				world.setBlock(x, y, 0, new Block(stack.item.id))
			break
	}
})
