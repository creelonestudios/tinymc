import Block from "../block/Block.js"
import Dim3 from "../dim/Dim3.js"
import Entity from "./Entity.js"
import Inventory from "../Inventory.js"
import Item from "../Item.js"
import ItemEntity from "./ItemEntity.js"
import ItemStack from "../ItemStack.js"
import { getTexture, player, world } from "../main.js"
import PlayerDef from "../defs/PlayerDef.js"
import Texture from "../texture/Texture.js"
import World from "../world/World.js"

export default class Player extends Entity {

	private name: string
	private skin: string
	#texture: Texture
	#selectedItemSlot: number
	readonly hotbar: Inventory
	
	constructor(skin: string, name: string) {
		super(new PlayerDef(), new Dim3(0, 0, 0))
		this.name = name
		this.hotbar = new Inventory(5)
		this.skin = skin
		this.#texture = getTexture((this.def as PlayerDef).skinAssetsPath(skin))
		this.#selectedItemSlot = 0
		this.size.set(1.5, 1.5)

		// for testing, temp
		this.hotbar.set(0, new ItemStack(new Item("tiny:stone"), 4))
		this.hotbar.set(1, new ItemStack(new Item("tiny:dirt")))
		this.hotbar.set(2, new ItemStack(new Item("tiny:water")))
		this.hotbar.set(3, new ItemStack(new Item("tiny:grass_block")))
		this.hotbar.set(4, new ItemStack(new Item("tiny:chest")))
	}

	get texture() {
		return this.#texture
	}

	get selectedItemSlot() {
		return this.#selectedItemSlot
	}

	set selectedItemSlot(x: number) {
		if (x >= 0 && x < this.hotbar.size) {
			this.#selectedItemSlot = Math.floor(x)
		}
	}

	get selectedItem() {
		return this.hotbar.get(this.selectedItemSlot)
	}

	addItems(stack: ItemStack) {
		let leftover = this.hotbar.addItems(stack)
		if (leftover) world.spawn(new ItemEntity(new ItemStack(player.selectedItem.item.id), player.position.copy()))
	}

	pickBlock(block: Block) {
		let blockItem = new Item(block.id)
		if (this.selectedItem.item.id == block.id || block.id == "tiny:air") return
		let index = this.hotbar.find(blockItem)
		if (index >= 0) this.#selectedItemSlot = index
		else { // TODO: creative mode only
			index = this.hotbar.firstEmptySlot()
			if (index >= 0) {
				this.#selectedItemSlot = index
				this.hotbar.set(index, new ItemStack(blockItem))
			}
			else {
				this.hotbar.set(this.#selectedItemSlot, new ItemStack(blockItem))
			}
		}
	}

	tick(world: World) {
		super.tick(world)
	}

	getData() {
		return {
			...super.getData(),
			selectedItem: this.selectedItem.getData(),
			selectedItemSlot: this.selectedItemSlot,
			playerName: this.name,
			hotbar: this.hotbar.getData()
		}
	}

}