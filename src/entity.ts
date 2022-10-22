import Dim3 from "./dim3.js"

export default class Entity {

	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3

	constructor() {
		this.position = new Dim3()
		this.rotation = new Dim3()
		this.motion   = new Dim3()
	}

	tick() {
		this.position.add(this.motion)
	}

}
