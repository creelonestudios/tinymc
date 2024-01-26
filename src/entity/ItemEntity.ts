import Dim3 from "../dim/Dim3.js";
import Entity from "./Entity.js";
import EntityDef from "../defs/EntityDef.js";
import ItemStack from "../ItemStack.js";
import { getMousePos, player } from "../main.js";
import World from "../world/World.js";

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
		const pickupDelay = this.spawnTime + ItemEntity.PICKUP_TIME - Date.now()
		const boundingBox = this.getBoundingBox()
		const touchingPlayer = boundingBox.intersect(player.getBoundingBox())
		const touchingMouse  = boundingBox.touch(getMousePos())

		if (touchingMouse || (touchingPlayer && pickupDelay <= 0)) {
			player.addItems(this.itemstack)
			world.removeEntity(this)
		}
	}

}
