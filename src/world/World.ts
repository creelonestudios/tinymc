import Graphics from "../Graphics.js"
import Block, { BlockData } from "../block/Block.js"
import Entity, { EntityData } from "../entity/Entity.js"
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import { getFirstBlock } from "../main.js"
import Player, { type PlayerData } from "../entity/Player.js"
import { createBlock, createEntity } from "../main.js"

export default class World {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || !data.blocks || !(data.blocks instanceof Map)) throw new Error("Could not parse World:", data)
		if (data.entities && !(data.entites instanceof Set)) throw new Error("Could not parse World:", data)
		let dims = data.dims
		if (dims instanceof Array && dims.length >= 6) {
			for (let i in dims) {
				if (isNaN(dims[i])) return // fill in default
				dims[i] = Number(dims[i])
			}
		} else return // fill in default dimensions
		let world = new World(dims)
		for (let b of data.blocks) {
			world.setBlock(b.x, b.y, b.z, b)
		}
		world.entities = data.entities || new Set()
		return world
	}

	static load(stringBlocks: string, blockData: BlockData[], dims: number[], entities: EntityData[]) {
		const semi = stringBlocks.indexOf(";")
		if (!semi) return // invalid save

		const blockIds = stringBlocks.substring(0, semi).split(",")
		const blocks = Array.from(stringBlocks.substring(semi + 1)).map(v => v.charCodeAt(0))

		const blockDataMap: Map<`${number},${number},${number}`, BlockData> = new Map()
		blockData.forEach(data => blockDataMap.set(`${data.x},${data.y},${data.z}`, data))

		const world = new World(dims)
		world.entities = new Set(entities.map(data => createEntity(data.id, data)))
		
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

	private blocks: Map<`${number},${number},${number}`, Block>
	private entities: Set<Entity>
	readonly minX: number
	readonly maxX: number
	readonly minY: number
	readonly maxY: number
	readonly minZ: number
	readonly maxZ: number

	constructor(dimensions: number[]) {
		[this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ] = dimensions
		this.blocks = new Map()
		this.entities = new Set()

		for (let x = this.minX; x <= this.maxX; x++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let z = this.minZ; z <= this.maxZ; z++) {
					this.blocks.set(`${x},${y},${z}`, new Block("tiny:air"))
				}
			}
		}
	}

	getBlock(x: number, y: number, z: number) {
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)
		return this.blocks.get(`${x},${y},${z}`)
	}

	getAllBlocks() {
		return Array.from(this.blocks.values())
	}

	setBlock(x: number, y: number, z: number, block: Block | string, data?: Partial<BlockData>) {
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)

		if (typeof block == "string") {
			block = createBlock(block, data)
		}	

		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) throw new Error(`Tried to set block outside the world: ${x},${y},${z}; ${block.id}`)
		this.blocks.set(`${x},${y},${z}`, block)
	}

	clearBlock(x: number, y: number, z: number) {
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) return
		this.blocks.set(`${x},${y},${z}`, new Block("tiny:air"))
	}

	getAllEntities<E extends Entity = Entity>(filter?: string | ((entity: Entity, index: number) => boolean)): E[] {
		let entities = Array.from(this.entities.values())
		if      (typeof filter == "string")   entities = entities.filter(entity => entity.id == filter)
		else if (typeof filter == "function") entities = entities.filter(filter)
		return entities as E[]
	}

	spawn<T extends EntityData = EntityData>(entity: Entity | string, data?: Partial<T>) {
		if (typeof entity == "string") {
			this.entities.add(createEntity(entity, data))
		} else {
			this.entities.add(entity)
		}		
	}

	removeEntity(entity: Entity) {
		this.entities.delete(entity)
	}

	tick() {
		for (let entity of this.entities.values()) {
			entity.tick(this)
		}
	}

	draw(g: Graphics) {

		for (let z = this.minZ; z <= this.maxZ; z++) {
			if (z == 0) { // draw entities behind blocks (e.g. water)
				for (let entity of this.getAllEntities()) {
					entity.draw(g)
				}
			}
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let x = this.minX; x <= this.maxX; x++) {
					const frontBlock = getFirstBlock(this, x, y)
					if (z >= frontBlock.z) this.getBlock(x, y, z)?.draw(g, x, y, z)
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
				for (let entity of this.getAllEntities()) {
					entity.getBoundingBox().draw(g, "red")
				}
			}
		}

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
					if (idIndex >= 0) {
						blocks[i] = idIndex
					} else {
						blockIds.push(block.id)
						blocks[i] = blockIds.length -1
					}
					i++
				}
			}
		}

		const entities: EntityData[] = []
		const players:  PlayerData[] = []

		Array.from(this.entities).forEach(entity =>{
			if (entity instanceof Player) {
				players.push(entity.getData())
			} else {
				entities.push(entity.getData())
			}
		})

		return {
			blockIds,
			blocks,
			stringBlocks: blockIds.join(",") + ";" + String.fromCharCode(...Array.from(blocks)),
			blockData,
			dims: [this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ],
			entities,
			players
		}
	}

	toYSON() {
		return {
			dims: [this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ],
			blocks: this.blocks,
			entites: this.entities
		}
	}

}
