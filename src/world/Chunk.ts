import Graphics from "../Graphics.js";
import Block, { BlockData } from "../block/Block.js";
import { createBlock } from "../main.js";
import World from "./World.js";
import { WorldGenerator } from "./WorldGenerator.js";

export default class Chunk {

	static readonly CHUNK_WIDTH = 16

	static worldX(chunk: Chunk, x: number) {
		return chunk.index * Chunk.CHUNK_WIDTH + x
	}

	private readonly world: World
	private readonly index: number
	private readonly blocks: Map<`${number},${number},${number}`, Block>

	constructor(world: World, index: number, generator: WorldGenerator) {
		this.world = world
		this.index = index
		this.blocks = new Map()

		const { minY, maxY, minZ, maxZ } = this.world
		for (let x = 0; x < Chunk.CHUNK_WIDTH; x++) {
			for (let y = minY; y <= maxY; y++) {
				for (let z = minZ; z <= maxZ; z++) {
					const block = new Block(generator(world, this.index, Chunk.worldX(this, x), y, z) || "tiny:air") || new Block("tiny:air")
					this.blocks.set(`${x},${y},${z}`, block)
				}
			}
		}

		for (let x = 0; x < Chunk.CHUNK_WIDTH; x++) {
			for (let z = minZ; z <= maxZ; z++) {
				world.scheduleBlockUpdate(Chunk.worldX(this, x), world.maxY, z)
			}
		}
	}

	validBlockPosition(x: number, y: number, z: number) {
		const { minY, maxY, minZ, maxZ } = this.world
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)
		if (y < minY || y > maxY || z < minZ || z > maxZ) return null
		if (x < 0 || x >= Chunk.CHUNK_WIDTH) return null

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

	setBlock(x: number, y: number, z: number, block: Block | string, data?: Partial<BlockData>) {
		const pos = this.validBlockPosition(x, y, z)
		if (!pos) {
			throw new Error(`Tried to set block outside of chunk ${this.index}: ${x},${y},${z}; ${block instanceof Block ? block.id : block}`)
		}
		[x, y, z] = pos

		if (typeof block == "string") {
			block = createBlock(block, data)
		}

		this.blocks.set(`${x},${y},${z}`, block)

		this.world.scheduleBlockUpdate(x, y, z)
		this.world.scheduleBlockUpdate(x-1, y, z)
		this.world.scheduleBlockUpdate(x+1, y, z)
		this.world.scheduleBlockUpdate(x, y-1, z)
		this.world.scheduleBlockUpdate(x, y+1, z)
		this.world.scheduleBlockUpdate(x, y, z-1)
		this.world.scheduleBlockUpdate(x, y, z+1)
	}

	clearBlock(x: number, y: number, z: number) {
		const pos = this.validBlockPosition(x, y, z)
		if (!pos) return
		[x, y, z] = pos

		const oldBlock = this.getBlock(x, y, z)
		if (oldBlock?.id == "tiny:air") return

		const block = new Block("tiny:air")
		this.blocks.set(`${x},${y},${z}`, block)

		this.world.scheduleBlockUpdate(x, y, z)
		this.world.scheduleBlockUpdate(x-1, y, z)
		this.world.scheduleBlockUpdate(x+1, y, z)
		this.world.scheduleBlockUpdate(x, y-1, z)
		this.world.scheduleBlockUpdate(x, y+1, z)
		this.world.scheduleBlockUpdate(x, y, z-1)
		this.world.scheduleBlockUpdate(x, y, z+1)
	}

	save() {
		const { minY, maxY, minZ, maxZ } = this.world
		const blockCount = Chunk.CHUNK_WIDTH * (maxY - minY +1) * (maxZ - minZ +1)
		const blocks = new Uint16Array(blockCount)
		const blockIds = ["tiny:air"]
		const blockData: BlockData[] = []

		let i = 0
		for (let z = minZ; z <= maxZ; z++) {
			for (let y = minY; y <= maxY; y++) {
				for (let x = 0; x < Chunk.CHUNK_WIDTH; x++) {
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

		return {
			blockIds,
			blocks,
			stringBlocks: blockIds.join(",") + ";" + String.fromCharCode(...Array.from(blocks)),
			blockData
		}
	}

}