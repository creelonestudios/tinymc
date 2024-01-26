import BlockDef from "../defs/BlockDef.js"
import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import { blockdefs } from "../main.js"
import Graphics from "../Graphics.js"

export default class Block {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)
		return new Block(data.id)
	}

	protected readonly def: BlockDef

	constructor(def: BlockDef | string) {
		if (def instanceof BlockDef) this.def = def
		else {
			let blockdef = blockdefs.get(def)
			if (blockdef) this.def = blockdef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
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

	hasInventory() {
		return this.def.hasInventory()
	}

	getBoundingBox(x: number, y: number) {
		x = Math.floor(x)
		y = Math.floor(y)
		return new BoundingBox(new Dim3(x, y), new Dim2(1, 1))
	}

	update() {

	}

	draw(g: Graphics, x: number, y: number) {
		if (this.def.id == "tiny:air") return
		g.save()
		g.translate(x, y)

		if (this.id == "tiny:water") g.globalAlpha = 0.35
		this.texture?.draw(g)

		g.restore()
	}

	getData(x: number, y: number, z: number) {
		return {
			id: this.id,
			x, y, z
		}
	}

}
