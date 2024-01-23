import Graphics from "../Graphics.js"
import Block from "../Block.js"
import Entity from "../entity/Entity.js"
import { player } from "../main.js"
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"

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

	static load(save: string, dims: number[], entities: Entity[]) {
		const semi = save.indexOf(";")
		if (!semi) return // invalid save

		const blockIds = save.substring(0, semi).split(",")
		const blocks = Array.from(save.substring(semi + 1)).map(v => v.charCodeAt(0))

		const world = new World(dims)
		world.entities = new Set(entities)
		
		let i = 0
		for (let z = world.minZ; z <= world.maxZ; z++) {
			for (let y = world.minY; y <= world.maxY; y++) {
				for (let x = world.minX; x <= world.maxX; x++) {
					world.setBlock(x, y, z, new Block(blockIds[blocks[i]] || "tiny:air")) // TODO: if blockID unknown, insert placeholder block
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

	setBlock(x: number, y: number, z: number, block: Block) {
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)
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

	getAllEntities() {
		return Array.from(this.entities.values())
	}

	spawn(entity: Entity) {
		this.entities.add(entity)
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
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let x = this.minX; x <= this.maxX; x++) {
					this.getBlock(x, y, z)?.draw(g, x, y)
				}
			}
			if (z == 0) {
				// player
				for (let entity of this.getAllEntities()) {
					entity.draw(g)
				}
				player.draw(g)
			}
		}

	}

	drawHitboxes(g: Graphics) {

		for (let z = this.minZ; z <= this.maxZ; z++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let x = this.minX; x <= this.maxX; x++) {
					this.getBlock(x, y, z)?.drawHitbox(g, x, y)
				}
			}
			if (z == 0) {
				// player
				for (let entity of this.getAllEntities()) {
					entity.drawHitbox(g)
				}
				player.drawHitbox(g)
			}
		}

	}

	save() {
		const blockCount = (this.maxX - this.minX +1) * (this.maxY - this.minY +1) * (this.maxZ - this.minZ +1)
		const blocks = new Uint16Array(blockCount)
		const blockIds = ["tiny:air"]

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

		return {
			blockIds,
			blocks,
			stringSave: blockIds.join(",") + ";" + String.fromCharCode(...Array.from(blocks)),
			dims: [this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ],
			entites: this.entities
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
