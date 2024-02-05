import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block, { type BlockData } from "./block/Block.js"
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
import ItemEntity, { type ItemEntityData, isItemEntityData } from "./entity/ItemEntity.js"
import ItemStack from "./ItemStack.js"
import Dim2 from "./dim/Dim2.js"
import { $ } from "./util/util.js"
import Graphics from "./Graphics.js"
import Container from "./util/Container.js"
import ContainerBlock from "./block/ContainerBlock.js"
import DebugScreen from "./util/DebugScreen.js"
import CreativeInventory from "./CreativeInventory.js"
import Entity, { type EntityData } from "./entity/Entity.js"

console.log("Never Gonna Give You Up")

// game info
export const GAME_NAME = "TinyMC"
export const GAME_VERSION = ""
export const GAME_VERSION_BRANCH = "main" // TODO: determine from git

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
export let debug = { showHitboxes: false, showOrigin: false, showDebugScreen: false, showAirLightLevel: false }

Hotbar.loadTexture()
Container.loadTexture()
WorldGenerator.flat(world)
world.spawn(player)

export const perf = {
	tick: 0,
	draw: 0
}
export const tickTarget = 20
export const drawTarget = 5
const perfTick = perfRun("tick", tick, 1000/tickTarget)
const perfDraw = perfRun("draw", draw, 1000/drawTarget)
setInterval(perfTick, 1000/tickTarget)
setInterval(() => requestAnimationFrame(perfDraw), 1000/drawTarget)

function perfRun(name: keyof typeof perf, fn: Function, target: number) {
	return () => {
		const before = performance.now()
		fn()
		const timeElapsed = performance.now() - before
		if (timeElapsed >= 1000) console.warn(`game lagging: last ${name} took ${timeElapsed}ms`)
		else if (timeElapsed >= target) console.debug(`%cgame lagging: last ${name} took ${timeElapsed}ms`, "color: skyblue")
		perf[name] = timeElapsed
	}
}

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

function tick() {
	player.motion.x = (Number(input.pressed("KeyD")) - Number(input.pressed("KeyA"))) * 0.25
	player.motion.y = (Number(input.pressed("KeyW")) - Number(input.pressed("KeyS"))) * 0.25
	world.tick()
}

function draw() {
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

	// debug screen
	if (debug.showDebugScreen) {
		DebugScreen.draw(graphics, world, player)
	}

}

export function getMouseBlock() {
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

		// temp
		debug.showAirLightLevel = debug.showOrigin
	}
	if (key == "KeyQ") {
		let stack = player.selectedItem
		let index = player.selectedItemSlot
		if (stack.item.id == "tiny:air") return
		if (input.pressed("ControlLeft")) { // drop whole stack
			world.spawn(new ItemEntity(stack, { position: player.position.asArray() }))
			player.hotbar.set(index, new ItemStack("tiny:air"))
		} else { // drop single item
			world.spawn(new ItemEntity(new ItemStack(stack.item.id), { position: player.position.asArray() }))
			if (stack.amount > 1) stack.amount--
			else player.hotbar.set(index, new ItemStack("tiny:air"))
		}
	}
	inv: if (key == "KeyE") { // open inventory under mouse
		if (Container.showingInventory()) {
			Container.setInventory()
			break inv
		}
		openInventory()
	}

	if (key == "KeyC") { // temp creative inv
		const items = Array.from(blockdefs.values())
		items.pop()
		const inv = new CreativeInventory(items)
		Container.setInventory(inv)
	}

	if (key == "F3") {
		debug.showDebugScreen = !debug.showDebugScreen
	}

	/*if (key == "KeyZ") {
		const worldSave = world.save()
		console.log("entities:", worldSave.entities)
		console.log("players:", worldSave.players)
		console.log("blockData:", worldSave.blockData)
		world = World.load(worldSave.stringBlocks, worldSave.blockData, worldSave.dims, worldSave.entities) as World
		world.spawn(player)
	}*/
})

input.on("click", (button: number) => {
	const {x, y} = getMouseBlock()
	let z = input.pressed("ShiftLeft") ? -1 : 0
	const {block: frontBlock, z: frontZ} = getFirstBlock(world, x, y)

	switch (button) {
		case 0:
			if (z < frontZ) break // inaccessible
			world.clearBlock(x, y, z)
			break
		case 1:
			if (!frontBlock || frontBlock.id == "tiny:air") break
			player.pickBlock(frontBlock)
			break
		case 2:
			const stack = player.selectedItem
			if (z != 0 && stack.item.getBlock().mainLayerOnly()) z = 0
			if (z < frontZ) break // inaccessible

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

input.on("mousemove", () => {
	const mouse = getMousePos()
	const items = world.getAllEntities<ItemEntity>("tiny:item")
	for (let item of items) {
		if (item.getBoundingBox().touch(mouse)) {
			const leftover = player.hotbar.addItems(item.itemstack)
			world.removeEntity(item)
			if (leftover) world.spawn<ItemEntityData>("tiny:item", { item: leftover.getData(), position: player.position.asArray() })
		}
	}
})

function openInventory() {
	const {x, y} = getMouseBlock()
	const block = world.getBlock(x, y, 0)
	if (!block?.hasInventory()) return
	Container.setInventory((block as ContainerBlock).inventory)
}

export function getFirstBlock(world: World, x: number, y: number, startZ: number = world.maxZ) {
	startZ = Math.min(startZ, world.maxZ)
	for (let z = startZ; z >= world.minZ; z--) {
		const block = world.getBlock(x, y, z)
		if (!block || !block.isSolid()) continue
		return { block, z }
	}
	return { block: world.getBlock(x, y, world.minZ), z: world.minZ }
}

export function getFirstFluid(world: World, x: number, y: number, startZ: number = world.maxZ) {
	startZ = Math.min(startZ, world.maxZ)
	for (let z = startZ; z >= world.minZ; z--) {
		const block = world.getBlock(x, y, z)
		if (!block || block.id == "tiny:air") continue
		return { block, z }
	}
	return { block: undefined, z: world.minZ }
}

export function createBlock<T extends BlockData = BlockData>(id: string, data: Partial<T> = {}) {
	const blockdef = blockdefs.get(id)
	if (!blockdef) {
		console.trace()
		throw "Block definition not found: " + id
	}

	if (blockdef.type == "container") return new ContainerBlock(blockdef, data)
	else return new Block(blockdef)
}

export function createEntity<T extends EntityData = EntityData>(id: string, data: Partial<T> = {}) {
	data.id = id
	if (isItemEntityData(data, id)) return new ItemEntity(null, data)
	else return new Entity(id, data)
}
