import Entity, { type EntityData } from "./Entity.js"
import { type Flatten, NamespacedId } from "../util/interfaces.js"
import ItemStack, { type ItemStackData } from "../ItemStack.js"
import { entitydefs } from "../main.js"
import Player from "./Player.js"
import ResourceLocation from "../util/ResourceLocation.js"
import World from "../world/World.js"

export default class ItemEntity extends Entity {

	static PICKUP_TIME: number = 40 // in ticks

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack | null, spawnTime: number, data: Partial<ItemEntityData> = {}) {
		super(entitydefs.get("tiny:item")!, spawnTime, data)
		this.itemstack = data.item ? new ItemStack(data.item.item.id, data.item.amount) : (itemstack || new ItemStack("tiny:air"))
		this.size.set(0.5, 0.5)
	}

	get texture() {
		return this.itemstack.item.texture
	}

	tick(world: World) {
		if (this.inFluid) this.motion.y = Entity.TERMINAL_FLUID_VELOCITY

		super.tick(world)
		if (this.motion.sqMag() > 0) this.rotation = this.motion.angle()
		else if (isNaN(this.rotation)) this.rotation = 0

		const pickupDelay = Math.max(this.spawnTime + ItemEntity.PICKUP_TIME - world.tickTime, 0)
		const boundingBox = this.getBoundingBox()

		// player collision
		if (pickupDelay <= 0) {
			const players = world.getAllEntities<Player>("tiny:player")

			for (const p of players) {
				if (boundingBox.intersect(p.getBoundingBox())) {
					const leftover = p.hotbar.addItems(this.itemstack)

					if (leftover) this.itemstack.amount = leftover.amount
					else {
						world.removeEntity(this)

						return
					}
				}
			}
		}

		// combine item entities
		const items = world.getAllEntities<ItemEntity>(entity => entity.id.matches("tiny:item") && (entity as ItemEntity).itemstack.match(this.itemstack))

		for (const item of items) {
			if (item == this) continue

			const stack = item.itemstack

			if (boundingBox.intersect(item.getBoundingBox())) {
				if (stack.amount + this.itemstack.amount < this.itemstack.item.maxItemStack) {
					stack.amount += this.itemstack.amount
					item.motion.add(this.motion)
					world.removeEntity(this)

					return
				}
			}
		}
	}

	getData(world: World) {
		return {
			...super.getData(),
			item:        this.itemstack.getData(),
			pickupDelay: Math.max(this.spawnTime + ItemEntity.PICKUP_TIME - world.tickTime, 0)
		}
	}

}

export type ItemEntityData = Flatten<EntityData & {
	item: ItemStackData,
	pickupDelay: number
}>

const itemEntityId = new ResourceLocation("tiny:item")

export function isItemEntityData(data: Partial<EntityData>, id: NamespacedId = data.id || ":"): data is ItemEntityData {
	return itemEntityId.matches(id)
}
