import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block from "./block/Block.js"
import BlockDef from "./defs/BlockDef.js"
import Texture from "./texture/Texture.js"
import World from "./world/World.js"
import Player from "./entity/Player.js"
import ItemDef from "./defs/ItemDef.js"
import Hotbar from "./util/Hotbar.js"
import WorldGenerator from "./world/WorldGenerator.js"
import Cam from "./Cam.js"
import Input from "./Input.js"
import EntityDef from "./defs/EntityDef.js"
import ItemEntity from "./entity/ItemEntity.js"
import ItemStack from "./ItemStack.js"
import Dim2 from "./dim/Dim2.js"
import { $ } from "./util/util.js"
import Graphics from "./Graphics.js"
import Container from "./util/Container.js"
import ContainerBlock from "./block/ContainerBlock.js"

console.log("Never Gonna Give You Up")

// constants
export const blockSize = 80
const gameOffset = new Dim2(0, -2)

// canvas
export const game = $<HTMLCanvasElement>("#game")
const graphics = new Graphics(game, blockSize)

// assets
const textures: Map<String, Texture> = new Map()

// defs
export const blockdefs  = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs   = await loadDefs<ItemDef>("items.yson", ItemDef)
export const entitydefs = await loadDefs<EntityDef>("entities.yson", EntityDef)
blockdefs.set("tiny:air", new BlockDef("tiny", "air", {}))

// other
export const world = new World([-20, 20, -20, 20, -1, 1])
export const player = new Player("jens", "TinyJens")
export const cam = new Cam(player)
export const input = new Input()
export let debug = { showHitboxes: false, showOrigin: false }

Hotbar.loadTexture()
Container.loadTexture()
WorldGenerator.flat(world)
world.spawn(player)
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
	// tick
	player.motion.x = (Number(input.pressed("KeyD")) - Number(input.pressed("KeyA"))) * 0.25
	player.motion.y = (Number(input.pressed("KeyW")) - Number(input.pressed("KeyS"))) * 0.25
	world.tick()

	// draw
	graphics.reset()

	graphics.save()
	graphics.translate(gameOffset.x, gameOffset.y) // move game by offset
	graphics.translate(-cam.x, -cam.y) // move game into view

	// world
	world.draw(graphics)

	// hitboxes
	if (debug.showHitboxes) {
		world.drawBoundingBoxes(graphics)
	}

	// origin / axis
	if (debug.showOrigin) {
		graphics.ctx.strokeStyle = "lime"
		graphics.ctx.beginPath()
		graphics.ctx.moveTo(0, -100)
		graphics.ctx.lineTo(0, 100)
		graphics.ctx.moveTo(-100, 0)
		graphics.ctx.lineTo(100, 0)
		graphics.ctx.stroke()
	}

	// block highlight
	{
		let mousePos = getMouseBlock().floor()

		graphics.save()
		graphics.translate(mousePos.x, mousePos.y)

		graphics.fillStyle = "transparent"
		graphics.strokeStyle = "white"
		graphics.lineWidth = 2
		graphics.strokeRect(1, 1)

		graphics.restore()
	}

	graphics.restore()

	// hotbar
	{
		Hotbar.drawHotbar(graphics)
	}

	// container
	{
		Container.drawContainer(graphics)
	}

}

function getMouseBlock() {
	return getMousePos().floor()
}

export function getMousePos() {
	return new Dim2(
		 (input.mouseX - game.width/2  + cam.x*blockSize) / blockSize - gameOffset.x,
		-(input.mouseY - game.height/2 - cam.y*blockSize) / blockSize - gameOffset.y
	)
}

input.on("keydown", (key: string) => {
	//console.log(key)
	if (key == "Digit1") player.selectedItemSlot = 0
	if (key == "Digit2") player.selectedItemSlot = 1
	if (key == "Digit3") player.selectedItemSlot = 2
	if (key == "Digit4") player.selectedItemSlot = 3
	if (key == "Digit5") player.selectedItemSlot = 4
	if (key == "KeyM") {
		debug.showHitboxes = !debug.showHitboxes

		// also show origin if shift is pressed
		if (!debug.showHitboxes) debug.showOrigin = false
		else if (input.pressed("ShiftLeft")) debug.showOrigin = true
	}
	if (key == "KeyQ") {
		let stack = player.selectedItem
		let index = player.selectedItemSlot
		if (stack.item.id == "tiny:air") return
		world.spawn(new ItemEntity(new ItemStack(stack.item.id), player.position.copy()))
		if (stack.amount > 1) stack.amount--
		else player.hotbar.set(index, new ItemStack("tiny:air"))
	}
	inv: if (key == "KeyE") { // open inventory under mouse
		if (Container.showingInventory()) {
			Container.setInventory()
			break inv
		}
		openInventory()
	}
})

input.on("click", (button: number) => {
	const {x, y} = getMouseBlock()
	let z = input.pressed("ShiftLeft") ? -1 : 0
	switch (button) {
		case 0:
			world.clearBlock(x, y, z)
			break
		case 1:
			let block = world.getBlock(x, y, 0)
			if (!block || block.id == "tiny:air") block = world.getBlock(x, y, -1)
			if (!block || block.id == "tiny:air") break
			player.pickBlock(block)
			break
		case 2:
			const stack = player.selectedItem
			if (z != 0 && stack.item.getBlock().mainLayerOnly()) z = 0

			const currentBlock = world.getBlock(x, y, z)
			if (currentBlock && !currentBlock.isSolid() && stack.item.isBlock()) {
				if (blockdefs.get(stack.item.id)?.type == "container") world.setBlock(x, y, z, new ContainerBlock(stack.item.id))
				else world.setBlock(x, y, z, new Block(stack.item.id))
			} else {
				openInventory()
			}
			break
	}
})

function openInventory() {
	const {x, y} = getMouseBlock()
	const block = world.getBlock(x, y, 0)
	if (!block?.hasInventory()) return
	Container.setInventory((block as ContainerBlock).inventory)
}
