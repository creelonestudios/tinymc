import { type Flatten, type HasData } from "./util/interfaces.js"
import ItemStack, { type ItemStackData } from "./ItemStack.js"
import Item from "./Item.js"

export default class Inventory implements HasData {

	readonly size: number
	readonly columns: number
	private slots: (ItemStack | undefined)[]

	constructor(size: number, columns: number = 9, data: InventoryData = []) {
		this.size = size
		this.columns = columns
		this.slots = []

		// fill slots with data
		data.forEach(stack => {
			this.slots[stack.slot] = new ItemStack(stack.item.id, stack.amount)
		})
	}

	set(index: number, stack: ItemStack) {
		if (index >= 0 && index < this.size) this.slots[index] = stack
		 else throw new Error(`IndexOutOfBounds: Inventory slot ${index} (0..${this.size})`)
	}

	get(index: number): ItemStack {
		if (index >= 0 && index < this.size) return this.slots[index] ?? new ItemStack("tiny:air")

		throw new Error(`IndexOutOfBounds: Inventory slot ${index} (0..${this.size})`)
	}

	each(cb: (value: ItemStack, index: number) => void) {
		return this.slots.forEach((stack, index) => cb(stack || new ItemStack("tiny:air"), index))
	}

	addItems(stack: ItemStack): ItemStack | null {
		let { amount } = stack

		for (const i of this.slots.keys()) {
			const slot = this.get(i)

			if (amount <= 0) break

			if (slot.item.id.matches("tiny:air")) {
				this.slots[i] = new ItemStack(stack.item.id, amount)

				return null
			}

			if (slot.match(stack)) {
				const available = slot.item.maxItemStack - slot.amount
				const d = Math.min(available, amount)

				slot.amount += d
				amount -= d
			}
		}

		if (amount > 0) return new ItemStack(stack.item.id, amount)

		return null
	}

	find(item: Item): number {
		for (const i of this.slots.keys()) if (this.get(i).match(item)) return Number(i)

		return -1
	}

	emptySlots(): number {
		let count = 0

		this.each(stack => {
			if (stack.item.id.matches("tiny:air")) count++
		})

		return count
	}

	firstEmptySlot(): number {
		for (const i of this.slots.keys()) if (this.get(i).item.id.matches("tiny:air")) return Number(i)

		return -1
	}

	getData() {
		const arr: (ReturnType<ItemStack["getData"]> & {slot: number})[] = []

		this.each((slot, index) => {
			if (slot.item.id.matches("tiny:air")) return

			arr.push({ ...slot.getData(), slot: index })
		})

		return arr
	}

}

export type InventoryData = Flatten<(ItemStackData & { slot: number })[]>
