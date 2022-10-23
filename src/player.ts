import Dim3 from "./dim3.js"
import Entity from "./entity.js"
import Inventory from "./inventory.js"
import Item from "./item.js"
import ItemStack from "./itemstack.js"
import { getTexture } from "./main.js"
import PlayerDef from "./playerdef.js"
import Texture from "./texture.js"

export default class Player extends Entity {

	private name: string
	private skin: string
	#texture: Texture
	#selectedItemSlot: number
	readonly hotbar: Inventory
	
	constructor(skin: string) {
		super(new PlayerDef())
		this.name = "tinypersson" // temp
		this.hotbar = new Inventory(5)
		this.skin = skin
		this.#texture = getTexture((this.def as PlayerDef).skinAssetsPath(skin))
		this.#selectedItemSlot = 0

		this.position.set(new Dim3(0, 1, 0))

		// for testing, temp
		this.hotbar.set(0, new ItemStack(new Item("tiny:stone")))
		this.hotbar.set(1, new ItemStack(new Item("tiny:dirt")))
		this.hotbar.set(2, new ItemStack(new Item("tiny:water")))
		this.hotbar.set(3, new ItemStack(new Item("tiny:grass_block")))
		this.hotbar.set(4, new ItemStack(new Item("tiny:air")))
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

	tick() {
		super.tick()
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
		super.draw(ctx, x, y, size, size*1.5)
	}

}
