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
		ctx.translate(-(inventory.size * slotSize)/2, -slotSize/2)

		ctx.strokeRect(0, 0, inventory.size * slotSize, slotSize)

		for (let i = 0; i < inventory.size; i++) {
			// slot
			slot.draw(g, slotSize, slotSize, true)

			// item
			const stack = inventory.get(i)
			if (stack.item.id != "tiny:air") {
				ctx.save()
				ctx.translate(inset, inset)
				stack.draw(g, itemSize)
				ctx.restore()
			}

			// translate
			ctx.translate(slotSize, 0)
		}

		ctx.restore()
	}

}
