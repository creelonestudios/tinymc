import Inventory from "../Inventory.js"
import BlockDef from "../defs/BlockDef.js"
import { HasInventory } from "../util/interfaces.js"
import Block from "./Block.js"

export default class ContainerBlock extends Block implements HasInventory {

	readonly inventory: Inventory

	constructor(def: BlockDef | string) {
		super(def)
		this.inventory = new Inventory(this.def.inventorySlots || 27, this.def.inventoryColumns || 9)
	}

	update() {

	}

	getData(x: number, y: number, z: number) {
		return {
			...super.getData(x, y, z),
			items: this.inventory.getData()
		}
	}

}
