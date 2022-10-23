import Dim3 from "./dim3.js";
import Entity from "./entity.js";
import EntityDef from "./entitydef.js";
import ItemStack from "./itemstack.js";

export default class ItemEntity extends Entity {

	readonly itemstack: ItemStack

	constructor(itemstack: ItemStack, position: Dim3) {
		super(new EntityDef("tiny", "item", {}), position)
		this.itemstack = itemstack
	}

	get texture() {
		return this.itemstack.item.texture
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
		super.draw(ctx, x, y, size, size*0.5)
	}

}