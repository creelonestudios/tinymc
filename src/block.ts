import BlockDef from "./blockdef.js"
import { blockdefs } from "./main.js"

export default class Block {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || !(data.c instanceof Array) || typeof data.id != "string" || data.c.length < 3) throw new Error("Could not parse Block:", data)
		for (let i in data.c) {
			if (isNaN(data.c[i])) new Error("Could not parse Block:", data)
			data.c[i] = Number(data.c[i])
		}
		return new Block(data.id, data.c[0], data.c[1], data.c[2])
	}

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

	toYSON() {
		return {
			id: this.id,
			c: [this.x, this.y, this.z] // c -> coordinates
		}
	}

}