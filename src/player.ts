import Entity from "entity.js"
import Inventory from "./inventory"

export default class Player extends Entity {

	private name: string
	readonly hotbar: Inventory
	
	constructor() {
		super()
		this.name = "tinypersson" // temp
		this.hotbar = new Inventory(5)
	}

}
