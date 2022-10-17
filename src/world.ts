import Block from "./block.js"

export default class World {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || !data.blocks || !(data.blocks instanceof Array)) throw new Error("Could not parse World:", data)
		let dims = data.dims
		if (dims instanceof Array && dims.length >= 6) {
			for (let i in dims) {
				if (isNaN(dims[i])) return // fill in default
				dims[i] = Number(dims[i])
			}
		} else return // fill in default dimensions
		let world = new World(dims, data.name)
		world.blocks = data.blocks
		return world
	}

	readonly name: string;
	private blocks: Map<string, Block>
	readonly minX: number
	readonly maxX: number
	readonly minY: number
	readonly maxY: number
	readonly minZ: number
	readonly maxZ: number

	constructor(dimensions: number[], name: string) {
		this.name = name;
		[this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ] = dimensions
		this.blocks = new Map()

		for (let x = this.minX; x <= this.maxX; x++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				for (let z = this.minZ; z <= this.maxZ; z++) {
					this.blocks.set(`${x},${y},${z}`, new Block("tiny:air", x, y, z))
				}
			}
		}
	}

	getBlock(x: number, y: number, z: number) {
		return this.blocks.get(`${x},${y},${z}`)
	}

	getAllBlocks() {
		return Array.from(this.blocks.values())
	}

	setBlock(x: number, y: number, z: number, block: Block) {
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) throw new Error(`Tried to set block outside the world: ${x},${y},${z}; ${block.id}`)
		this.blocks.set(`${x},${y},${z}`, block)
	}

	clearBlock(x: number, y: number, z: number) {
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) return
		this.blocks.set(`${x},${y},${z}`, new Block("tiny:air", x, y, z))
	}

	toYSON() {
		return {
			dims: [this.minX, this.maxX, this.minY, this.maxY, this.minY, this.maxZ],
			blocks: this.getAllBlocks(),
			name: this.name
		}
	}

}