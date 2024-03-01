import Entity, { type EntityData } from "./Entity.js";
import EntityDef from "../defs/EntityDef.js";
import ItemStack, { type ItemStackData } from "../ItemStack.js";
import World from "../world/World.js";
import Player from "./Player.js"
import { type Flatten } from "../util/interfaces.js";

export default class ItemEntity extends Entity {

	static PICKUP_TIME: number = 40 // in ticks

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack | null, spawnTime: number, data: Partial<ItemEntityData> = {}) {
		super(new EntityDef("tiny", "item", { hasFriction: true }), spawnTime, data)
		this.itemstack = data.item ? new ItemStack(data.item.item.id, data.item.amount) : (itemstack || new ItemStack("tiny:air"))
		this.size.set(0.5, 0.5)
	}

	get texture() {
		return this.itemstack.item.texture
	}

	tick(world: World) {
		if (this.inFluid) this.motion.y = Entity.TERMINAL_FLUID_VELOCITY
		super.tick(world)
    
		const pickupDelay = Math.max(this.spawnTime + ItemEntity.PICKUP_TIME - world.tickTime, 0)
		const boundingBox = this.getBoundingBox()

		// player collision
		if (pickupDelay <= 0) {
			const players = world.getAllEntities<Player>("tiny:player")
			for (let p of players) {
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
		const items = world.getAllEntities<ItemEntity>(entity => {
			return entity.id == "tiny:item" && (entity as ItemEntity).itemstack.match(this.itemstack)
		})
		for (let item of items) {
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
			item: this.itemstack.getData(),
			pickupDelay: Math.max(this.spawnTime + ItemEntity.PICKUP_TIME - world.tickTime, 0)
		}
	}

}

export type ItemEntityData = Flatten<EntityData & {
	item: ItemStackData,
	pickupDelay: number
}>

export function isItemEntityData(data: Partial<EntityData>, id: string = data.id || ""): data is ItemEntityData {
	return id == "tiny:item"
}
