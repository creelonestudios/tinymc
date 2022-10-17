import BlockDef from "./blockdef.js"
import { blockdefs } from "./main.js"

export default class Block {

	private readonly def: BlockDef
	readonly x: number
	readonly y: number
	readonly z: number

	constructor(def: BlockDef | string, x: number, y: number, z: number) {
		if (def instanceof BlockDef) this.def = def
		else {
			let blockdef = blockdefs.get(def)
			if (blockdef) this.def = blockdef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
		this.x = x
		this.y = y
		this.z = z
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	get maxItemStack() {
		return this.def.maxItemStack
	}

}