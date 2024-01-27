import Inventory, { type InventoryData } from "../Inventory.js"
import BlockDef from "../defs/BlockDef.js"
import { type HasInventory } from "../util/interfaces.js"
import Block, { type BlockData } from "./Block.js"

export default class ContainerBlock extends Block implements HasInventory {

	readonly inventory: Inventory

	constructor(def: BlockDef | string, data: Partial<ContainerBlockData> = {}) {
		super(def)
		this.inventory = new Inventory(this.def.inventorySlots || 27, this.def.inventoryColumns || 9, data.items)
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

export type ContainerBlockData = BlockData & {
	items: InventoryData
}
