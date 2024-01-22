import Dim3 from "../dim/dim3.js";
import Entity from "./entity.js";
import EntityDef from "../defs/entitydef.js";
import ItemStack from "../itemstack.js";
import { getMousePos, player } from "../main.js";
import World from "../world/world.js";

export default class ItemEntity extends Entity {

	static PICKUP_TIME: number = 40 * 50 // 40 ticks

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack, position: Dim3) {
		super(new EntityDef("tiny", "item", {}), position)
		this.itemstack = itemstack
		this.size.set(0.5, 0.5)
	}

	get texture() {
		return this.itemstack.item.texture
	}

	tick(world: World) {
		super.tick(world)
		let pickupDelay = this.spawnTime + ItemEntity.PICKUP_TIME - Date.now()
		if (this.getBoundingBox().touch(getMousePos())) {
			player.addItems(this.itemstack)
			world.removeEntity(this)
		}
		if (this.getBoundingBox().intersect(player.getBoundingBox()) && pickupDelay <= 0) {
			player.addItems(this.itemstack)
			world.removeEntity(this)
		}
	}

}
