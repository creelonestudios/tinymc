import Block, { BlockData } from "../../block/Block.js"
import Entity, { EntityData } from "../../entity/Entity.js"
import ItemEntity, { ItemEntityData, isItemEntityData } from "../../entity/ItemEntity.js"
import Player, { PlayerData } from "../../entity/Player.js"
import { blockdefs, cursors, debug, game, input, menuState } from "../../main.js"
import Cam from "../../Cam.js"
import Container from "../../util/Container.js"
import ContainerBlock from "../../block/ContainerBlock.js"
import CreativeInventory from "../../CreativeInventory.js"
import DebugScreen from "../../util/DebugScreen.js"
import Dim2 from "../../dim/Dim2.js"
import Graphics from "../../Graphics.js"
import Hotbar from "../../util/Hotbar.js"
import ItemStack from "../../ItemStack.js"
import MenuState from "../../enums/MenuState.js"
import { NamespacedId } from "../../util/interfaces.js"
import World from "../../world/World.js"
import WorldGenerator from "../../world/WorldGenerator.js"

// constants
export const blockSize = 80
const gameOffset = new Dim2(0, -2)

// other
export let world: World
export let player: Player
export let cam: Cam

// offscreen graphics
let og: Graphics

export function init() {
	og = new Graphics(new OffscreenCanvas(game.width, game.height), blockSize)
}

export function createWorld(name: string): World {
	world = new World(name, [-20, 20, -20, 20, -1, 1])
	player = new Player("jens", "TinyJens", 0)
	cam = new Cam(player)
	WorldGenerator.flat(world)
	world.spawn(player)

	return world
}

export function loadWorld(newWorld: World, playerData: PlayerData) {
	// console.log(playerData)
	world  = newWorld
	player = new Player("jens", "TinyJens", playerData.spawnTime, playerData)
	cam = new Cam(player)
	world.spawn(player)
}

export function tick() {
	if (input.keyPressed("Space")) {
		if (player.inFluid) player.motion.y = Entity.TERMINAL_FLUID_VELOCITY
		else if (player.onGround) player.motion.y = player.attributes.get("generic.jump_strength", 0.35)!
	}

	player.motion.x = (Number(input.keyPressed("KeyD")) - Number(input.keyPressed("KeyA"))) * 0.15

	world.tick()
}

export function draw(g: Graphics) {
	if (menuState == MenuState.INGAME) drawGame()

	g.reset()

	if (menuState == MenuState.INGAME_MENU) {
		g.save()
		g.blur(4)
		g.ctx.drawImage(og.canvas, 0, 0)
		g.restore()
	} else {
		g.ctx.drawImage(og.canvas, 0, 0)
	}

	// cursor
	if (menuState == MenuState.INGAME) {
		const { x, y } = getMousePos()
		const size = blockSize/2

		g.save()
		g.ctx.translate(game.width/2, game.height/2) // center game
		g.translate(gameOffset.x, gameOffset.y) // move game by offset
		g.translate(-cam.x, -cam.y) // move game into view
		g.translate(x, y)

		const floatingStack = Container.floatingStack()
		const { block: frontBlock, z: frontZ } = getFirstBlock(world, x, y)
		const z = input.keyPressed("ShiftLeft") ? -1 : 0
		const targetBlock = world.getBlock(x, y, z)
		const inaccessible = z < frontZ && frontBlock?.full

		const mouseBlock = getMouseBlock()
		const reachable = isBlockReachable(mouseBlock)

		if (!reachable) {
			drawCrosshair(g, size, "#707070")
		} else if (floatingStack) {
			g.ctx.translate(-size/2, -size/2)
			floatingStack.draw(g, size)
		} else if (player.selectedItem.item.id != "tiny:air" && !inaccessible && targetBlock?.id == "tiny:air") {
			g.ctx.translate(-size/2, -size/2)
			g.globalAlpha = 0.8
			player.selectedItem.item.texture?.draw(g, size, size, true)
		} else if (targetBlock?.type == "container") {
			g.ctx.translate(-size/2, -size)
			cursors.openContainer.draw(g, size, size, true)
		} else {
			drawCrosshair(g, size, "white")
		}

		g.restore()
	}

	// debug screen
	if (debug.showDebugScreen) DebugScreen.draw(g, world, player)
}

function drawGame() {
	og.canvas.width  = game.width
	og.canvas.height = game.height
	og.reset()
	og.ctx.translate(og.canvas.width/2, og.canvas.height/2) // center game

	og.save()
	og.translate(gameOffset.x, gameOffset.y) // move game by offset
	og.translate(-cam.x, -cam.y) // move game into view

	// world
	world.draw(og)

	// hitboxes
	if (debug.showDebugScreen && debug.showHitboxes) world.drawBoundingBoxes(og)


	// origin / axis
	if (debug.showDebugScreen && debug.showOrigin) {
		og.ctx.strokeStyle = "lime"
		og.ctx.beginPath()
		og.ctx.moveTo(0, -100)
		og.ctx.lineTo(0, 100)
		og.ctx.moveTo(-100, 0)
		og.ctx.lineTo(100, 0)
		og.ctx.stroke()
	}

	const mouseBlock = getMouseBlock()
	const reachable = isBlockReachable(mouseBlock)

	// block highlight
	if (menuState == MenuState.INGAME) {
		og.save()
		og.translate(mouseBlock.x, mouseBlock.y)

		og.fillStyle = "transparent"
		og.strokeStyle = reachable ? "white" : "#707070"
		og.lineWidth = reachable ? 2 : 1
		og.strokeRect(1, 1)

		og.restore()
	}

	// distance and player range (debug)
	if (debug.showDebugScreen && debug.showRange) {
		const range  = (player.attributes.get("player.block_interaction_range", 0)!) * blockSize

		og.lineWidth = 2
		og.strokeStyle = "white"
		og.fillStyle = "white"

		const blockpos  = mouseBlock.add(new Dim2(0.5, 0.5))
		const playerpos = player.position.copy().add(new Dim2(0, player.eyeHeight))

		og.save()
		og.translate(blockpos.x + 0.2, blockpos.y)
		og.drawText(blockpos.distanceTo(playerpos).toFixed(2))
		og.restore()

		blockpos.scale(blockSize)
		playerpos.scale(blockSize)
		const { x, y } = playerpos

		og.ctx.beginPath()
		og.ctx.ellipse(x, -y, range, range, 0, 0, 2 * Math.PI)
		og.ctx.stroke()

		og.ctx.beginPath()
		og.ctx.ellipse(blockpos.x,  -blockpos.y,  10, 10, 0, 0, 2 * Math.PI)
		og.ctx.moveTo(blockpos.x,  -blockpos.y)
		og.ctx.lineTo(playerpos.x, -playerpos.y)
		og.ctx.ellipse(playerpos.x, -playerpos.y, 10, 10, 0, 0, 2 * Math.PI)
		og.ctx.stroke()
	}

	og.restore()

	// hotbar
	Hotbar.drawHotbar(og)

	// container
	Container.drawContainer(og)
}

export function onKey(key: string) {
	if (Container.showingInventory()) if (Container.onKey(key)) return


	if (key == "Digit1") player.selectedItemSlot = 0
	if (key == "Digit2") player.selectedItemSlot = 1
	if (key == "Digit3") player.selectedItemSlot = 2
	if (key == "Digit4") player.selectedItemSlot = 3
	if (key == "Digit5") player.selectedItemSlot = 4

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

	if (key == "F3") debug.showDebugScreen = !debug.showDebugScreen


	if (input.keyPressed("F3") && debug.showDebugScreen) {
		if (key == "KeyN") debug.showRange = !debug.showRange


		if (key == "KeyM") {
			debug.showHitboxes = !debug.showHitboxes
			debug.showOrigin = debug.showHitboxes
		}

		if (key == "KeyK") debug.showAirLightLevel = !debug.showAirLightLevel
	}

	/* if (key == "KeyZ") {
		const worldSave = world.save()
		console.log("entities:", worldSave.entities)
		console.log("players:", worldSave.players)
		console.log("blockData:", worldSave.blockData)
		world = World.load(worldSave.stringBlocks, worldSave.blockData, worldSave.dims, worldSave.entities) as World
		world.spawn(player)
	}*/
}

export function whileKey(key: string) {
	if (key == "KeyQ") {
		const stack = player.selectedItem
		const index = player.selectedItemSlot

		if (stack.item.id == "tiny:air") return

		const entityData = {
			position: player.eyes.asArray(),
			motion:   Dim2.polar(player.rotationAngle, 0.6).asArray()
		}
		let dropStack = stack

		if (!input.keyPressed("ControlLeft")) dropStack = new ItemStack(stack.item.id)


		if (input.keyPressed("ControlLeft") || stack.amount <= 1) player.hotbar.set(index, new ItemStack("tiny:air"))
		 else stack.amount--

		world.spawn<ItemEntityData>("tiny:item", { ...entityData, item: dropStack })
	}
}

export function onClick(button: number) {
	if (Container.showingInventory()) if (Container.onClick(button)) return


	const mouseBlock = getMouseBlock()
	const { x, y } = mouseBlock
	let z = input.keyPressed("ShiftLeft") ? -1 : 0
	const { block: frontBlock, z: frontZ } = getFirstBlock(world, x, y)
	const reachable = isBlockReachable(mouseBlock)

	switch (button) {
	case 0:
		if (!reachable) break
		if (z < frontZ && frontBlock?.full) break // inaccessible

		world.clearBlock(x, y, z, false)

		break
	case 1:
		if (!frontBlock || frontBlock.id == "tiny:air") break

		player.pickBlock(frontBlock)

		break
	case 2: {
		if (!reachable) break

		const stack = player.selectedItem

		if (z != 0 && stack.item.getBlock().mainLayerOnly()) z = 0
		if (z < frontZ && frontBlock?.full) break // inaccessible

		const currentBlock = world.getBlock(x, y, z)

		if (currentBlock && !currentBlock.isSolid() && stack.item.isBlock()) world.setBlock(x, y, z, stack.item.getBlock(), {}, false)
			 else openInventory()

		break
	}
	}
}

export function onMouseMove() {
	const mouse = getMousePos()
	const items = world.getAllEntities<ItemEntity>("tiny:item")

	for (const item of items) {
		if (item.getBoundingBox().touch(mouse)) {
			const reachable = item.position.distanceTo(player.position) <= player.attributes.get("player.entity_interaction_range")!

			if (!reachable) continue

			const leftover = player.hotbar.addItems(item.itemstack)

			world.removeEntity(item)
			if (leftover) world.spawn<ItemEntityData>("tiny:item", { item: leftover.getData(), position: player.position.asArray() })
		}
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

function isBlockReachable(pos: Dim2) {
	return pos.copy().add(new Dim2(0.5, 0.5))
		.distanceTo(player.position.copy()
			.add(new Dim2(0, player.eyeHeight))) <= player.attributes.get("player.block_interaction_range", 0)!
}

function drawCrosshair(g: Graphics, size: number, color: string) {
	g.strokeStyle = color
	g.lineWidth = 2
	g.ctx.beginPath()
	g.ctx.moveTo(0, -size/3)
	g.ctx.lineTo(0,  size/3)
	g.ctx.moveTo(-size/3, 0)
	g.ctx.lineTo(size/3, 0)
	g.ctx.stroke()
}

function openInventory() {
	const { x, y } = getMouseBlock()
	const block = world.getBlock(x, y, 0)

	if (!block?.hasInventory()) return

	Container.setInventory((block as ContainerBlock).inventory)
}

export function getFirstBlock(w: World, x: number, y: number, startZ: number = w.maxZ, predicate?: (block: Block) => boolean) {
	startZ = Math.min(startZ, w.maxZ)
	for (let z = startZ; z >= w.minZ; z--) {
		const block = w.getBlock(x, y, z)

		if (!block || !block.isSolid()) continue
		if (predicate && !predicate(block)) continue

		return { block, z }
	}

	return { block: undefined, z: w.minZ }
}

export function getFirstFluid(w: World, x: number, y: number, startZ: number = w.maxZ) {
	startZ = Math.min(startZ, w.maxZ)
	for (let z = startZ; z >= w.minZ; z--) {
		const block = w.getBlock(x, y, z)

		if (!block || block.id == "tiny:air") continue

		return { block, z }
	}

	return { block: undefined, z: w.minZ }
}

export function createBlock<T extends BlockData = BlockData>(id: NamespacedId, data: Partial<T> = {}) {
	const blockdef = blockdefs.get(id)

	if (!blockdef) {
		throw new Error(`Block definition not found: ${id}`)
	}

	if (blockdef.type == "container") return new ContainerBlock(blockdef, data)

	return new Block(blockdef)
}

export function createEntity<T extends EntityData = EntityData>(id: NamespacedId, spawnTime: number, data: Partial<T> = {}) {
	data.id = id
	if (isItemEntityData(data, id)) return new ItemEntity(null, spawnTime, data)

	return new Entity(id, spawnTime, data)
}
