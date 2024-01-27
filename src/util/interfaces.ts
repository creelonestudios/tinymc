import Inventory from "../Inventory"

export interface HasInventory {
	inventory: Inventory
}

export type BaseData = {
	id: string
}
