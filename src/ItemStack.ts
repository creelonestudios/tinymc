import Graphics from "./Graphics.js"
import Item, { type ItemData } from "./Item.js"
import { type NamespacedId, type HasData } from "./util/interfaces.js"

export default class ItemStack implements HasData {

	readonly item: Item
	#amount: number

	constructor(item: Item | NamespacedId, amount: number = 1) {
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

	draw(g: Graphics, size: number, hideAmount: boolean = false) {
		if (this.item.id == "tiny:air") return
		this.item.texture?.draw(g, size, size, true)

		if (this.amount != 1 && !hideAmount) {
			g.save()
			g.ctx.translate(size * 0.95, size * 0.95)
			g.ctx.textAlign = "center"
			g.ctx.textBaseline = "middle"
			g.drawText(this.amount + "", { color: "white", font: { size: size/2 } })
			g.restore()
		}
	}

	getData(): ItemStackData {
		return {
			item: this.item.getData(),
			amount: this.amount
		}
	}

}

export type ItemStackData = {
	item: ItemData,
	amount: number
}
