export default class Entity {
	#x: number
	#y: number
	#z: number
	#rotation: number[]

	constructor() {
		this.#x = 0
		this.#y = 0
		this.#z = 0
		this.#rotation = [0, 0, 0]
	}

}
