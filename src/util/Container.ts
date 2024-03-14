import CreativeInventory from "../CreativeInventory.js"
import Graphics from "../Graphics.js"
import Inventory from "../Inventory.js"
import ItemStack from "../ItemStack.js"
import Dim2 from "../dim/Dim2.js"
import { game, getTexture, input, player } from "../main.js"
import Texture from "../texture/Texture.js"

let slot: Texture
let inventory: Inventory | undefined
let floatingStackIndex: number | undefined

const scale = 4
const slotSize = 12 * scale
const itemSize = 8 * scale
const inset = (slotSize - itemSize)/2

export default class Container {

	static loadAssets() {
		slot = getTexture("tiny/textures/gui/container/slot.png")
	}

	static setInventory(inv?: Inventory) {
		inventory = inv
		floatingStackIndex = undefined
	}

	static showingInventory() {
		return inventory != undefined
	}

	static floatingStack() {
		if ((floatingStackIndex != undefined && inventory)) {
			const stack = inventory.get(floatingStackIndex)
			if (stack.item.id != "tiny:air") return stack
			else { // shouldn't happen, but just in case
				floatingStackIndex = undefined
			}
		}
		return undefined
	}

	static drawContainer(g: Graphics) {
		if (!slot.ready || !inventory) return
		const ctx = g.ctx
		ctx.save()
		const offset = new Dim2((inventory.columns * slotSize)/2, (Math.ceil(inventory.size / inventory.columns) * slotSize)/2)
		ctx.translate(-offset.x, -offset.y)

		// slot
		drawSlots(g, inventory, () => {
			slot.draw(g, slotSize, slotSize, true)
		})

		// item
		drawSlots(g, inventory, (inv, i) => {
			const stack = inv.get(i)
			if (stack.item.id != "tiny:air" && i != floatingStackIndex) {
				ctx.save()
				ctx.translate(inset, inset)
				stack.draw(g, itemSize, inv instanceof CreativeInventory)
				ctx.restore()
			}
		})

		// hover
		const mouseSlot = this.getMouseSlot()
		if (mouseSlot) {
			const { slotPos } = mouseSlot
			ctx.save()
			ctx.fillStyle = "white"
			ctx.globalAlpha = 0.3
			ctx.translate(slotPos.x * slotSize, slotPos.y * slotSize)
			ctx.fillRect(0, 0, slotSize, slotSize)
			ctx.restore()
		}

		ctx.restore()
	}

	static getMouseSlot() {
		if (!slot.ready || !inventory) return
		const offset = new Dim2((inventory.columns * slotSize)/2, (Math.ceil(inventory.size / inventory.columns) * slotSize)/2)
		const mouse = input.mouse
		mouse.add(new Dim2(-game.width/2, -game.height/2))
		mouse.add(offset)
		const slotPos = new Dim2(mouse.x / slotSize, mouse.y / slotSize).floor()
		const rows = Math.ceil(inventory.size / inventory.columns)

		if (slotPos.x < 0 || slotPos.x >= inventory.columns || slotPos.y < 0 || slotPos.y >= rows) return null
		const slotIndex = slotPos.y * inventory.columns + slotPos.x

		if (slotIndex >= 0 && slotIndex < inventory.size) {
			return { slotPos, slotIndex }
		}

		return null
	}
	
	static onClick(button: number): boolean { // true -> an action was performed
		if (!inventory) return false
		const mouseSlot = this.getMouseSlot()
		if (!mouseSlot) return false

		if (button == 0) {
			if (input.keyPressed("ShiftLeft")) {
				const stack = inventory.get(mouseSlot.slotIndex)
				if (stack.item.id == "tiny:air") return false
				const leftOver = player.hotbar.addItems(stack)
				if (leftOver) {
					stack.amount = leftOver.amount
				} else {
					inventory.set(mouseSlot.slotIndex, new ItemStack("tiny:air"))
				}
			} else {
				const stack = inventory.get(mouseSlot.slotIndex)
				const previous = Container.floatingStack()
				
				if (floatingStackIndex != undefined) {
					inventory.set(mouseSlot.slotIndex, previous || new ItemStack("tiny:air"))
					inventory.set(floatingStackIndex,  stack    || new ItemStack("tiny:air"))
				}

				if (floatingStackIndex == undefined && stack.item.id != "tiny:air") floatingStackIndex = mouseSlot.slotIndex
				else if (stack.item.id == "tiny:air" || floatingStackIndex == mouseSlot.slotIndex) {
					floatingStackIndex = undefined
				}
			}
		}

		return true
	}

	static onKey(key: string): boolean { // true -> an action was performed
		if (!inventory) return false
		const mouseSlot = this.getMouseSlot()
		if (!mouseSlot || mouseSlot.slotIndex == floatingStackIndex) return false

		if (!key.startsWith("Digit")) return false
		const hotbarIndex = +key.substring(5)
		if (!hotbarIndex || hotbarIndex < 1 || hotbarIndex > player.hotbar.size) return false

		// swap item stacks
		const invStack    = inventory.get(mouseSlot.slotIndex)
		const hotbarStack = player.hotbar.get(hotbarIndex-1)
		inventory.set(mouseSlot.slotIndex, hotbarStack)
		player.hotbar.set(hotbarIndex-1, invStack)

		return true
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
