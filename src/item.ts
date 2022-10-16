import ItemDef from "./itemdef.js"
import BlockDef from "./blockdef.js"
import { itemdefs, blockdefs } from "./main.js"

export default class Item {

	readonly def: ItemDef | BlockDef

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

}