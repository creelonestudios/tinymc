import Block from "./block.js"

export default class World {

	private blocks: Map<string, Block>
	readonly minX: number
	readonly maxX: number
	readonly minY: number
	readonly maxY: number
	readonly minZ: number
	readonly maxZ: number

	constructor(dimensions: number[]) {
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
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) throw new Error(`Tried to set block outside the world: ${x},${y},${z}; ${block.def.id}`)
		this.blocks.set(`${x},${y},${z}`, block)
	}

	clearBlock(x: number, y: number, z: number) {
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) return
		this.blocks.set(`${x},${y},${z}`, new Block("tiny:air", x, y, z))
		console.log("deleted block", x, y, z)
	}

}