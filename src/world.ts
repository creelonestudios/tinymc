import Block from "./block.js"
import Dim3 from "./dim3.js"
import Entity from "./entity.js"

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

	private blocks: Map<string, Block>
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

	toYSON() {
		return {
			dims: [this.minX, this.maxX, this.minY, this.maxY, this.minY, this.maxZ],
			blocks: this.blocks,
			entites: this.entities
		}
	}

}