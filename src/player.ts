import Entity from "./entity.js"
import Inventory from "./inventory.js"
import { getTexture } from "./main.js"
import Texture from "./texture.js"

export default class Player extends Entity {

	private name: string
	private skin: string
	#texture: Texture
	readonly hotbar: Inventory
	
	constructor(skin: string) {
		super()
		this.name = "tinypersson" // temp
		this.hotbar = new Inventory(5)
		this.skin = skin
		this.#texture = getTexture(`tiny/textures/skin/${this.skin}/${this.skin}.png`)
	}

	get texture() {
		return this.#texture
	}

}
