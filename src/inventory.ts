import Item from "./item.js"
import ItemStack from "./itemstack.js"

export default class Inventory {

	readonly size: number
	private slots: ItemStack[]

	constructor(size: number) {
		this.size = size
		this.slots = []
		for (let i = 0; i < this.size; i++) {
			this.slots[i] = new ItemStack(new Item("tiny:air"), 1)
		}
	}

	set(index: number, stack: ItemStack) {
		if (index >= 0 && index < this.size) {
			this.slots[index] = stack
		} else {
			throw new Error(`IndexOutOfBounds: Inventory slot ${index} (0..${this.size})`)
		}
	}

	get(index: number) {
		if (index >= 0 && index < this.size) {
			return this.slots[index]
		} else {
			throw new Error(`IndexOutOfBounds: Inventory slot ${index} (0..${this.size})`)
		}
	}

}