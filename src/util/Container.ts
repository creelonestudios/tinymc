import CreativeInventory from "../CreativeInventory.js"
import Graphics from "../Graphics.js"
import Inventory from "../Inventory.js"
import { getTexture } from "../main.js"
import Texture from "../texture/Texture.js"

let slot: Texture
let inventory: Inventory | undefined

const scale = 4
const slotSize = 12 * scale
const itemSize = 8 * scale
const inset = (slotSize - itemSize)/2

export default class Container {

	static loadTexture() {
		slot = getTexture("tiny/textures/gui/container/slot.png")
	}

	static setInventory(inv?: Inventory) {
		inventory = inv
	}

	static showingInventory() {
		return inventory != undefined
	}

	static drawContainer(g: Graphics) {
		if (!slot.ready || !inventory) return
		const ctx = g.ctx
		ctx.save()
		ctx.translate(-(inventory.columns * slotSize)/2, -(Math.ceil(inventory.size / inventory.columns) * slotSize)/2)

		// slot
		drawSlots(g, inventory, () => {
			slot.draw(g, slotSize, slotSize, true)
		})

		// item
		drawSlots(g, inventory, (inv, i) => {
			const stack = inv.get(i)
			if (stack.item.id != "tiny:air") {
				ctx.save()
				ctx.translate(inset, inset)
				stack.draw(g, itemSize, inv instanceof CreativeInventory)
				ctx.restore()
			}
		})

		ctx.restore()
	}

}

function drawSlots(g: Graphics, inventory: Inventory, cb: (inv: Inventory, i: number) => void) {
	const ctx = g.ctx
	ctx.save()

	let column = 0
	for (let i = 0; i < inventory.size; i++) {
		cb(inventory, i)

		// translate
		column++
		if (column < inventory.columns) {
			ctx.translate(slotSize, 0)
		} else {
			ctx.translate(-(inventory.columns - 1) * slotSize, slotSize)
			column = 0
		}
		
	}

	ctx.restore()
}
