import Entity, { type EntityData } from "./Entity.js";
import EntityDef from "../defs/EntityDef.js";
import ItemStack, { type ItemStackData } from "../ItemStack.js";
import { getMousePos, player } from "../main.js";
import World from "../world/World.js";

export default class ItemEntity extends Entity {

	static PICKUP_TIME: number = 40 * 50 // 40 ticks

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack | null, data: Partial<ItemEntityData> = {}) {
		super(new EntityDef("tiny", "item", { hasFriction: true }), data)
		this.itemstack = data.item ? new ItemStack(data.item.item.id, data.item.amount) : (itemstack || new ItemStack("tiny:air"))
		this.size.set(0.5, 0.5)
	}

	get texture() {
		return this.itemstack.item.texture
	}

	tick(world: World) {
		super.tick(world)
		const pickupDelay = this.spawnTime + ItemEntity.PICKUP_TIME - Date.now()
		const boundingBox = this.getBoundingBox()
		const touchingPlayer = boundingBox.intersect(player.getBoundingBox())
		const touchingMouse  = boundingBox.touch(getMousePos())

		if (touchingMouse || (touchingPlayer && pickupDelay <= 0)) {
			player.addItems(this.itemstack)
			world.removeEntity(this)
		}
	}

	getData() {
		return {
			...super.getData(),
			item: this.itemstack.getData(),
			pickupDelay: Math.floor((this.spawnTime + ItemEntity.PICKUP_TIME - Date.now()) * 20 / 1000) // should be in ticks
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
