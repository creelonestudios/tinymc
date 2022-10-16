import ItemDef from "./itemdef.js"

export default class Item {

	readonly def: ItemDef

	constructor(def: ItemDef) {
		this.def = def
	}

}