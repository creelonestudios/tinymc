import Item from "./Item.js"
import ItemStack, { type ItemStackData } from "./ItemStack.js"
import { type Flatten, type HasData } from "./util/interfaces.js"

export default class Inventory implements HasData {

	readonly size: number
	readonly columns: number
	private slots: ItemStack[]

	constructor(size: number, columns: number = 9, data: InventoryData = []) {
		this.size = size
		this.columns = columns
		this.slots = []

		// fill with air (default)
		for (let i = 0; i < this.size; i++) {
			this.slots[i] = new ItemStack(new Item("tiny:air"), 1)
		}

		// fill slots with data
		data.forEach(stack => {
			this.slots[stack.slot] = new ItemStack(stack.item.id, stack.amount)
		})
		
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

	each(cb: (value: ItemStack, index: number) => void) {
		return this.slots.forEach(cb)
	}

	addItems(stack: ItemStack): ItemStack | null {
		let amount = stack.amount

		for (let i in this.slots) {
			let slot = this.slots[i]
			if (amount <= 0) break

			if (slot.item.id == "tiny:air") {
				this.slots[i] = new ItemStack(stack.item.id, amount)
				return null
			}

			if (slot.match(stack)) {
				let available = slot.item.maxItemStack - slot.amount
				let d = Math.min(available, amount)
				slot.amount += d
				amount -= d
			}
		}

		if (amount > 0) return new ItemStack(stack.item.id, amount)
		return null
	}

	find(item: Item): number {
		for (let i in this.slots) {
			if (this.slots[i].match(item)) return Number(i)
		}
		return -1
	}

	emptySlots(): number {
		let count = 0
		for (let slot of this.slots) {
			if (slot.item.id == "tiny:air") count++
		}
		return count
	}

	firstEmptySlot(): number {
		for (let i in this.slots) {
			if (this.slots[i].item.id == "tiny:air") return Number(i)
		}
		return -1
	}

	getData() {
		const arr: (ReturnType<ItemStack["getData"]> & {slot: number})[] = []
		this.slots.forEach((slot, index) => {
			if (slot.item.id == "tiny:air") return
			arr.push({...slot.getData(), slot: index})
		})
		return arr
	}

}

export type InventoryData = Flatten<(ItemStackData & { slot: number })[]>