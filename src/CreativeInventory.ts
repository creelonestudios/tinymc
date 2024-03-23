import BlockDef from "./defs/BlockDef.js"
import Inventory from "./Inventory.js"
import Item from "./Item.js"
import ItemDef from "./defs/ItemDef.js"
import ItemStack from "./ItemStack.js"

export default class CreativeInventory extends Inventory {

	private readonly defs: (ItemDef | BlockDef)[]

	constructor(defs: (ItemDef | BlockDef)[]) {
		super(Math.ceil(defs.length / 9) * 9, 9)
		this.defs = defs
	}

	set() {
		return
	}

	get(index: number) {
		if (index >= this.defs.length) return new ItemStack("tiny:air")

		const def = this.defs[index]

		return new ItemStack(new Item(def), def.maxItemStack)
	}

}
