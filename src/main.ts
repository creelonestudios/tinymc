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
import Item from "./Item.js"

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
export const player = new Player("jens", "TinyJens", 0)
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
export const drawTarget = 20
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
	player.motion.x = (Number(input.pressed("KeyD")) - Number(input.pressed("KeyA"))) * 0.15
	//player.motion.y = (Number(input.pressed("KeyW")) - Number(input.pressed("KeyS"))) * 0.25
	if (player.inFluid && input.pressed("Space")) player.motion.y = Entity.TERMINAL_FLUID_VELOCITY
	world.tick()
}

const item = new Item("tiny:stone")

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

	const mouseBlock = getMouseBlock()
	const reachable = mouseBlock.distanceTo(player.position) <= player.attributes.get("player.block_interaction_range")!

	// block highlight
	{
		graphics.save()
		graphics.translate(mouseBlock.x, mouseBlock.y)

		graphics.fillStyle = "transparent"
		graphics.strokeStyle = reachable ? "white" : "#707070"
		graphics.lineWidth = reachable ? 2 : 1
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

	// cursor
	{
		const mouse = getMousePos()
		const size = blockSize/2
		graphics.save()
		graphics.translate(gameOffset.x, gameOffset.y) // move game by offset
		graphics.translate(-cam.x, -cam.y) // move game into view
		graphics.translate(mouse.x, mouse.y)

		const floatingStack = Container.floatingStack()
		if (floatingStack) {
			graphics.ctx.translate(-size/2, -size/2)
			floatingStack.draw(graphics, size)
		} else if (reachable && player.selectedItem.item.id != "tiny:air") {
			graphics.ctx.translate(-size/2, -size/2)
			graphics.globalAlpha = 0.8
			player.selectedItem.item.texture?.draw(graphics, size, size, true)
		} else {
			graphics.strokeStyle = reachable ? "white" : "#707070"
			graphics.lineWidth = 2
			graphics.ctx.beginPath()
			graphics.ctx.moveTo(0, -size/3)
			graphics.ctx.lineTo(0,  size/3)
			graphics.ctx.moveTo(-size/3, 0)
			graphics.ctx.lineTo( size/3, 0)
			graphics.ctx.stroke()
		}
		
		graphics.restore()
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
	if (Container.showingInventory()) {
		if (Container.onKey(key)) return
	}

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
		const stack = player.selectedItem
		const index = player.selectedItemSlot
		if (stack.item.id == "tiny:air") return

		const entityData = {
			position: player.position.asArray(),
			motion: getMousePos().sub(player.position).normalize().scale(0.6).asArray()
		}
		let dropStack = stack

		if (!input.pressed("ControlLeft")) {
			dropStack = new ItemStack(stack.item.id)
		}

		if (input.pressed("ControlLeft") || stack.amount <= 1) {
			player.hotbar.set(index, new ItemStack("tiny:air"))
		} else stack.amount--

		world.spawn<ItemEntityData>("tiny:item", { ...entityData, item: dropStack })
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

	if (key == "Space") {
		if (!player.inFluid && player.onGround) player.motion.y = 0.35
	}

	if (key == "F11" || key == "F1") {
		if (document.fullscreenElement) document.exitFullscreen()
		else game.requestFullscreen()
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
	if (Container.showingInventory()) {
		if (Container.onClick(button)) return
	}

	const mouseBlock = getMouseBlock()
	const {x, y} = mouseBlock
	let z = input.pressed("ShiftLeft") ? -1 : 0
	const {block: frontBlock, z: frontZ} = getFirstBlock(world, x, y)
	const reachable = mouseBlock.distanceTo(player.position) <= player.attributes.get("player.block_interaction_range")!

	switch (button) {
		case 0:
			if (!reachable) break
			if (z < frontZ && frontBlock?.full) break // inaccessible
			world.clearBlock(x, y, z)
			break
		case 1:
			if (!frontBlock || frontBlock.id == "tiny:air") break
			player.pickBlock(frontBlock)
			break
		case 2:
			if (!reachable) break
			const stack = player.selectedItem
			if (z != 0 && stack.item.getBlock().mainLayerOnly()) z = 0
			if (z < frontZ && frontBlock?.full) break // inaccessible

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
			const reachable = item.position.distanceTo(player.position) <= player.attributes.get("player.entity_interaction_range")!
			if (!reachable) continue

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

export function getFirstBlock(world: World, x: number, y: number, startZ: number = world.maxZ, predicate?: (block: Block) => boolean) {
	startZ = Math.min(startZ, world.maxZ)
	for (let z = startZ; z >= world.minZ; z--) {
		const block = world.getBlock(x, y, z)
		if (!block || !block.isSolid()) continue
		if (predicate && !predicate(block)) continue
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

export function createEntity<T extends EntityData = EntityData>(id: string, spawnTime: number, data: Partial<T> = {}) {
	data.id = id
	if (isItemEntityData(data, id)) return new ItemEntity(null, spawnTime, data)
	else return new Entity(id, spawnTime, data)
}
