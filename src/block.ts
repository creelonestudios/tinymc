import BlockDef from "./defs/blockdef.js"
import BoundingBox from "./boundingbox.js"
import Dim2 from "./dim/dim2.js"
import Dim3 from "./dim/dim3.js"
import { blockdefs } from "./main.js"
import Graphics from "./Graphics.js"

export default class Block {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)
		return new Block(data.id)
	}

	private readonly def: BlockDef

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

		this.texture?.draw(g)

		g.restore()
	}

	drawHitbox(g: Graphics, x: number, y: number) {
		if (this.def.id == "tiny:air") return
		g.save()
		g.translate(x, y)

		g.strokeStyle = "blue"
		g.lineWidth = 1
		g.strokeRect()
		
		g.restore()
	}

	toYSON() {
		return {
			id: this.id
		}
	}

}
