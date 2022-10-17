import Item from "./item.js"

export default class ItemStack {

	readonly item: Item
	#amount: number

	constructor(item: Item, amount: number = 1) {
		this.item = item
		if (amount > 0 && amount < this.item.def.maxItemStack) this.#amount = amount
		else throw new Error(`ItemStack amount (${amount}) exceeds maxItemStack (${this.item.def.maxItemStack}) of ${this.item.def.id}`)
	}

	get amount() {
		return this.#amount
	}

	set amount(x: number) {
		if (x > 0 && x < this.item.def.maxItemStack) this.#amount = x
	}

}