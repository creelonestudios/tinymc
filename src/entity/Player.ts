import Block from "../block/Block.js"
import Entity, { EntityData } from "./Entity.js"
import Inventory, { InventoryData } from "../Inventory.js"
import Item from "../Item.js"
import { ItemEntityData } from "./ItemEntity.js"
import ItemStack, { ItemStackData } from "../ItemStack.js"
import { getMousePos, getTexture, player, world } from "../main.js"
import PlayerDef from "../defs/PlayerDef.js"
import Texture from "../texture/Texture.js"
import World from "../world/World.js"
import { type Flatten } from "../util/interfaces.js"
import Dim2 from "../dim/Dim2.js"

const playerDef = new PlayerDef()

export default class Player extends Entity {

	private name: string
	private skin: string
	#texture: Texture
	#selectedItemSlot: number
	readonly hotbar: Inventory
	
	constructor(skin: string, name: string, spawnTime: number, data: Partial<PlayerData> = {}) {
		super(playerDef, spawnTime, { ...data, position: [0, 1, 0] })
		this.name = name
		this.hotbar = data.hotbar ? new Inventory(5, 5, data.hotbar) : new Inventory(5)
		this.skin = skin
		this.#texture = getTexture((this.def as PlayerDef).skinAssetsPath(skin))
		this.#selectedItemSlot = data.selectedItemSlot || 0
		this.size.set(1.5, 1.5)
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
		if (leftover) world.spawn<ItemEntityData>("tiny:item", { item: new ItemStack(player.selectedItem.item.id), position: player.position.asArray() })
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

	die() { // respawn
		this.position.set(0, 1, 0) // TODO: spawn point
		this.motion.set(0, 0, 0)
		this.rotation = 0
	}

	tick(world: World) {
		super.tick(world)
		const eyes = this.position.copy().add(new Dim2(0, this.eyeHeight))
		this.rotation = getMousePos().sub(eyes).angle()
	}

	getData(): PlayerData {
		return {
			...super.getData(),
			selectedItem: this.selectedItem.getData(),
			selectedItemSlot: this.selectedItemSlot,
			playerName: this.name,
			hotbar: this.hotbar.getData()
		}
	}

}

export type PlayerData = Flatten<EntityData & {
	selectedItem: ItemStackData,
	selectedItemSlot: number,
	playerName: string,
	hotbar: InventoryData
}>
