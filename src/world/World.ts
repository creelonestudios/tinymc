import Block, { BlockData } from "../block/Block.js"
import { blockSize, cam, createBlock, createEntity, gameOffset, getFirstBlock } from "../gui/state/ingame.js"
import Entity, { EntityData } from "../entity/Entity.js"
import Player, { type PlayerData } from "../entity/Player.js"
import Dim2 from "../dim/Dim2.js"
import { game } from "../main.js"
import Graphics from "../Graphics.js"
import { isNamespacedId } from "../util/typecheck.js"
import LightColor from "../util/LightColor.js"
import { type NamespacedId } from "../util/interfaces.js"

// import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"

export default class World {

	// eslint-disable-next-line
	static fromYSON(data: any) {
		if (!(data instanceof Object) || !data.blocks || !(data.blocks instanceof Map)) throw new Error("Could not parse World:", data)
		if (data.entities && !(data.entites instanceof Set)) throw new Error("Could not parse World:", data)

		const { dims } = data

		if (dims instanceof Array && dims.length >= 6) {
			for (const i in dims) {
				if (isNaN(dims[i])) return // fill in default

				dims[i] = Number(dims[i])
			}
		} else return // fill in default dimensions

		const world = new World("", dims)

		for (const b of data.blocks) world.setBlock(b.x, b.y, b.z, b)

		world.entities = data.entities || new Set()

		return world
	}

	static load(name: string, stringBlocks: string, blockData: BlockData[], dims: number[], entities: EntityData[]) {
		const semi = stringBlocks.indexOf(";")

		if (!semi) return // invalid save

		const blockIdStrings: string[] = stringBlocks.substring(0, semi).split(",")
		const blockIds: NamespacedId[] = blockIdStrings.map(v => {
			if (isNamespacedId(v)) return v

			return "tiny:air"
		})
		const blocks = Array.from(stringBlocks.substring(semi + 1)).map(v => v.charCodeAt(0))

		const blockDataMap: Map<`${number},${number},${number}`, BlockData> = new Map()

		blockData.forEach(data => blockDataMap.set(`${data.x},${data.y},${data.z}`, data))

		const world = new World(name, dims)

		world.entities = new Set(entities.map(data => createEntity(data.id, data.spawnTime, data)))

		let i = 0
		for (let z = world.minZ; z <= world.maxZ; z++) {
			for (let y = world.minY; y <= world.maxY; y++) {
				for (let x = world.minX; x <= world.maxX; x++) {
					const data = blockDataMap.get(`${x},${y},${z}`)

					world.setBlock(x, y, z, createBlock(blockIds[blocks[i]] || "tiny:air", data)) // TODO: if blockID unknown, insert placeholder block
					i++
				}
			}
		}

		return world
	}

	readonly name: string

	private blocks: Map<`${number},${number},${number}`, Block>
	private entities: Set<Entity>
	private tickCount: number
	skyLightColor: LightColor
	readonly minX: number
	readonly maxX: number
	readonly minY: number
	readonly maxY: number
	readonly minZ: number
	readonly maxZ: number

	private updateQueue: ({ x: number, y: number, z: number })[]

	constructor(name: string, dimensions: number[]) {
		this.name = name
		;[this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ] = dimensions
		this.blocks = new Map()
		this.entities = new Set()
		this.tickCount = 0
		this.skyLightColor = new LightColor(15, 15, 15)

		for (let x = this.minX; x <= this.maxX; x++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let z = this.minZ; z <= this.maxZ; z++) {
					this.blocks.set(`${x},${y},${z}`, new Block("tiny:air"))
				}
			}
		}


		this.updateQueue = []
	}

	get tickTime() {
		return this.tickCount
	}

	get skyLight() {
		return this.skyLightColor
	}

	validBlockPosition(x: number, y: number, z: number) {
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) return null

		return [x, y, z]
	}

	getBlock(x: number, y: number, z: number) {
		const pos = this.validBlockPosition(x, y, z)

		if (!pos) return

		[x, y, z] = pos

		return this.blocks.get(`${x},${y},${z}`)
	}

	getAllBlocks() {
		return Array.from(this.blocks.values())
	}

	setBlock(x: number, y: number, z: number, block: Block | NamespacedId, data?: Partial<BlockData>, silent = true) {
		const pos = this.validBlockPosition(x, y, z)

		if (!pos) return

		[x, y, z] = pos

		if (typeof block == "string") block = createBlock(block, data)


		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) {
			throw new Error(`Tried to set block outside the world: ${x},${y},${z}; ${block.id}`)
		}

		this.blocks.set(`${x},${y},${z}`, block)
		if (!silent && block.id != "tiny:air") block.playSound("place")

		this.scheduleBlockUpdate(x, y, z)
		this.scheduleBlockUpdate(x-1, y, z)
		this.scheduleBlockUpdate(x+1, y, z)
		this.scheduleBlockUpdate(x, y-1, z)
		this.scheduleBlockUpdate(x, y+1, z)
		this.scheduleBlockUpdate(x, y, z-1)
		this.scheduleBlockUpdate(x, y, z+1)
	}

	clearBlock(x: number, y: number, z: number, silent = true) {
		const pos = this.validBlockPosition(x, y, z)

		if (!pos) return

		[x, y, z] = pos

		const oldBlock = this.getBlock(x, y, z)

		if (!oldBlock || oldBlock.id == "tiny:air") return
		if (!silent) oldBlock?.playSound("break")

		const block = new Block("tiny:air")

		this.blocks.set(`${x},${y},${z}`, block)

		this.scheduleBlockUpdate(x, y, z)
		this.scheduleBlockUpdate(x-1, y, z)
		this.scheduleBlockUpdate(x+1, y, z)
		this.scheduleBlockUpdate(x, y-1, z)
		this.scheduleBlockUpdate(x, y+1, z)
		this.scheduleBlockUpdate(x, y, z-1)
		this.scheduleBlockUpdate(x, y, z+1)
	}

	getAllEntities<E extends Entity = Entity>(filter?: string | ((entity: Entity, index: number) => boolean)): E[] {
		let entities = Array.from(this.entities.values())
		if      (typeof filter == "string")   entities = entities.filter(entity => entity.id == filter)
		else if (typeof filter == "function") entities = entities.filter(filter)

		return entities as E[]
	}

	spawn<T extends EntityData = EntityData>(entity: Entity | NamespacedId, data?: Partial<T>) {
		if (typeof entity == "string") this.entities.add(createEntity(entity, this.tickCount, data))
		 else this.entities.add(entity)
	}

	removeEntity(entity: Entity) {
		this.entities.delete(entity)
	}

	tick() {
		for (const entity of this.entities.values()) entity.tick(this)


		// block updates
		let entry: {x: number, y: number, z: number} | undefined
		if (this.updateQueue.length > 0) {
			// eslint-disable-next-line no-cond-assign
			while (entry = this.updateQueue.shift()) {
				const { x, y, z } = entry
				const block = this.getBlock(x, y, z)

				block?.update(this, x, y, z)
			}
		}

		// increase tick count
		this.tickCount++
	}

	draw(g: Graphics) {
		// screen edges
		const left   = Math.floor((-game.width /2  + cam.x*blockSize) / blockSize - gameOffset.x)
		const top    = Math.ceil(-(-game.height/2  - cam.y*blockSize) / blockSize - gameOffset.y)
		const right  = Math.ceil((game.width   /2  + cam.x*blockSize) / blockSize - gameOffset.x)
		const bottom = Math.floor(-(game.height/2  - cam.y*blockSize) / blockSize - gameOffset.y)

		for (let z = this.minZ; z <= this.maxZ; z++) {
			if (z == 0) { // draw entities behind blocks (e.g. water)
				for (const entity of this.getAllEntities()) entity.draw(g, this)
			}

			for (let y = Math.max(this.minY, bottom); y <= Math.min(this.maxY, top); y++) {
				for (let x = Math.max(this.minX, left); x <= Math.min(this.maxX, right); x++) {
					const frontBlock = getFirstBlock(this, x, y, undefined, block => block.full)

					if (z >= frontBlock.z) this.getBlock(x, y, z)?.draw(g, this, x, y, z)
				}
			}
		}
	}

	drawBoundingBoxes(g: Graphics) {
		for (let z = this.minZ; z <= this.maxZ; z++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let x = this.minX; x <= this.maxX; x++) {
					const block = this.getBlock(x, y, z)

					if (!block || block.id == "tiny:air") continue

					block.getBoundingBox(x, y).draw(g, "blue")
				}
			}

			if (z == 0) {
				for (const entity of this.getAllEntities()) {
					entity.getBoundingBox().draw(g, "red")

					// eye ray
					const { eyes } = entity
					const dir  = Dim2.polar(entity.rotationAngle, 100)
					const endpoint = eyes.copy().add(dir)

					g.save()
					g.strokeStyle = "red"
					g.translate(eyes.x, eyes.y)
					g.ctx.beginPath()
					g.ctx.moveTo(0, 0)
					g.ctx.lineTo(endpoint.x, -endpoint.y)
					g.ctx.stroke()
					g.restore()
				}
			}
		}
	}

	scheduleBlockUpdate(x: number, y: number, z: number) {
		const pos = this.validBlockPosition(x, y, z)

		if (!pos) return

		[x, y, z] = pos
		if (this.updateQueue.find(e => e.x == x && e.y == y && e.z == z)) return

		this.updateQueue.push({ x, y, z })
	}

	save() {
		const blockCount = (this.maxX - this.minX +1) * (this.maxY - this.minY +1) * (this.maxZ - this.minZ +1)
		const blocks = new Uint16Array(blockCount)
		const blockIds = ["tiny:air"]
		const blockData: BlockData[] = []

		let i = 0
		for (let z = this.minZ; z <= this.maxZ; z++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let x = this.minX; x <= this.maxX; x++) {
					const block = this.getBlock(x, y, z)

					if (!block) {
						blocks[i] = 0
						i++
						continue
					}
					if (block.type == "container") blockData.push(block.getData(x, y, z))

					const idIndex = blockIds.indexOf(block.id)

					if (idIndex >= 0) blocks[i] = idIndex
					 else {
						blockIds.push(block.id)
						blocks[i] = blockIds.length -1
					}

					i++
				}
			}
		}

		const entities: EntityData[] = []
		const players:  PlayerData[] = []

		Array.from(this.entities).forEach(entity => {
			if (entity instanceof Player) players.push(entity.getData())
			 else entities.push(entity.getData(this))
		})

		return {
			blockIds,
			blocks,
			stringBlocks: `${blockIds.join(",")};${String.fromCharCode(...Array.from(blocks))}`,
			blockData,
			dims:         [this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ],
			entities,
			players,
			name:         this.name
		}
	}

	toYSON() {
		return {
			dims:    [this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ],
			blocks:  this.blocks,
			entites: this.entities
		}
	}

}

export type WorldSave = ReturnType<World["save"]>
