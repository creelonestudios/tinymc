import ItemDef from "./itemdef.js"
import BlockDef from "./blockdef.js"
import { itemdefs, blockdefs } from "./main.js"

export default class Item {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)
		return new Item(data.id)
	}

	private readonly def: ItemDef | BlockDef

	constructor(def: ItemDef | BlockDef | string) {
		if (def instanceof ItemDef || def instanceof BlockDef) this.def = def
		else {
			let itemdef = itemdefs.get(def) || blockdefs.get(def)
			if (itemdef) this.def = itemdef
			else {
				console.trace()
				throw "Item definition not found: " + def
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

	toYSON() {
		return {
			id: this.id
		}
	}

}