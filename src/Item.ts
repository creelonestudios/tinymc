import { type BaseData, type Flatten, type HasData, type NamespacedId } from "./util/interfaces.js"
import { blockdefs, itemdefs } from "./main.js"
import BlockDef from "./defs/BlockDef.js"
import { createBlock } from "./gui/state/ingame.js"
import ItemDef from "./defs/ItemDef.js"

export default class Item implements HasData {

	// eslint-disable-next-line
	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)

		return new Item(data.id)
	}

	private readonly def: ItemDef | BlockDef

	constructor(def: ItemDef | BlockDef | NamespacedId) {
		if (def instanceof ItemDef || def instanceof BlockDef) this.def = def
		else {
			const itemdef = itemdefs.get(def) || blockdefs.get(def)

			if (itemdef) this.def = itemdef
			else {
				throw new Error(`Item definition not found: ${def}`)
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

	isBlock() {
		return this.def instanceof BlockDef
	}

	match(item: Item) {
		return this.id == item.id
	}

	getBlock() {
		if (!(this.def instanceof BlockDef)) throw new Error("Item is not a Block!")

		return createBlock(this.def.id)
	}

	getData(): ItemData {
		return { id: this.id }
	}

}

export type ItemData = Flatten<BaseData>
