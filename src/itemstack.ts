import Item from "./item.js"

export default class ItemStack {

	readonly item: Item
	#amount: number

	constructor(item: Item | string, amount: number = 1) {
		if (item instanceof Item) this.item = item
		else this.item = new Item(item)
		if (amount > 0 && amount <= this.item.maxItemStack) this.#amount = amount
		else throw new Error(`ItemStack amount (${amount}) exceeds maxItemStack (${this.item.maxItemStack}) of ${this.item.id}`)
	}

	get amount() {
		return this.#amount
	}

	set amount(x: number) {
		if (x > 0 && x <= this.item.maxItemStack) this.#amount = x
	}

	match(item: Item | ItemStack) {
		item = item instanceof Item ? item : item.item
		return this.item.match(item)
	}

	getData() {
		return {
			item: this.item.getData(),
			amount: this.amount
		}
	}

}
