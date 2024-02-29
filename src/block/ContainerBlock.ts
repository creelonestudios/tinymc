import Inventory, { type InventoryData } from "../Inventory.js"
import BlockDef from "../defs/BlockDef.js"
import { type NamespacedId, type Flatten, type HasInventory } from "../util/interfaces.js"
import Block, { type BlockData } from "./Block.js"

export default class ContainerBlock extends Block implements HasInventory {

	readonly inventory: Inventory

	constructor(def: BlockDef | NamespacedId, data: Partial<ContainerBlockData> = {}) {
		super(def)
		this.inventory = new Inventory(this.def.inventorySlots || 27, this.def.inventoryColumns || 9, data.items)
	}

	getData(x: number, y: number, z: number): ContainerBlockData {
		return {
			...super.getData(x, y, z),
			items: this.inventory.getData()
		}
	}

}

export type ContainerBlockData = Flatten<BlockData & {
	items: InventoryData
}>
