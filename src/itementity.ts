import Dim3 from "./dim3.js";
import Entity from "./entity.js";
import EntityDef from "./entitydef.js";
import ItemStack from "./itemstack.js";

export default class ItemEntity extends Entity {

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
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) {
		super.draw(ctx, x, y, blockSize)
	}

}