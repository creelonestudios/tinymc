import Entity, { type EntityData } from "./Entity.js";
import EntityDef from "../defs/EntityDef.js";
import ItemStack, { type ItemStackData } from "../ItemStack.js";
import { getMousePos, player } from "../main.js";
import World from "../world/World.js";
import Player from "./Player.js"

export default class ItemEntity extends Entity {

	static PICKUP_TIME: number = 40 * 50 // 40 ticks

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack | null, data: Partial<ItemEntityData> = {}) {
		super(new EntityDef("tiny", "item", {}), data)
		this.itemstack = data.item ? new ItemStack(data.item.item.id, data.item.amount) : (itemstack || new ItemStack("tiny:air"))
		this.size.set(0.5, 0.5)
	}

	get texture() {
		return this.itemstack.item.texture
	}

	tick(world: World) {
		super.tick(world)
		const pickupDelay = Math.max(this.spawnTime + ItemEntity.PICKUP_TIME - Date.now(), 0)
		const boundingBox = this.getBoundingBox()

		// player collision
		if (pickupDelay <= 0) {
			const players = world.getAllEntities<Player>("tiny:player")
			for (let p of players) {
				if (boundingBox.intersect(p.getBoundingBox())) {
					p.addItems(this.itemstack)
					world.removeEntity(this)
					return
				}
			}
		}

		// combine item entities
		const items = world.getAllEntities<ItemEntity>("tiny:item")
		for (let item of items) {
			if (item == this) continue
			const stack = item.itemstack
			if (stack.item.id == this.itemstack.item.id && boundingBox.intersect(item.getBoundingBox())) {
				if (stack.amount + this.itemstack.amount < this.itemstack.item.maxItemStack) {
					stack.amount += this.itemstack.amount
					world.removeEntity(this)
					return
				}
			}
		}
	}

	getData() {
		return {
			...super.getData(),
			item: this.itemstack.getData(),
			pickupDelay: Math.max(Math.floor((this.spawnTime + ItemEntity.PICKUP_TIME - Date.now()) * 20 / 1000), 0) // should be in ticks
		}
	}

}

export type ItemEntityData = EntityData & {
	item: ItemStackData,
	pickupDelay: number
}

export function isItemEntityData(data: Partial<EntityData>, id: string = data.id || ""): data is ItemEntityData {
	return id == "tiny:item"
}
