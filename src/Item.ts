import ItemDef from "./defs/ItemDef.js"
import BlockDef from "./defs/BlockDef.js"
import { itemdefs, blockdefs } from "./main.js"
import Block from "./block/Block.js"
import { type HasData, type BaseData, type Flatten } from "./util/interfaces.js"

export default class Item implements HasData {

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

	isBlock() {
		return this.def instanceof BlockDef
	}

	match(item: Item) {
		return this.id == item.id
	}

	getBlock() {
		if (!(this.def instanceof BlockDef)) throw new Error("Item is not a Block!")
		return new Block(this.def)
	}

	getData(): ItemData {
		return {
			id: this.id
		}
	}

}

export type ItemData = Flatten<BaseData>
