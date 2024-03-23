import Dim3 from "./dim/Dim3.js"
import Entity from "./entity/Entity.js"

export default class Cam {

	private entity: Entity | null
	private pos: Dim3

	constructor(entity?: Entity) {
		if (!entity) {
			this.entity = null
			this.pos = new Dim3(0, 0, 0)

			return
		}

		this.entity = entity
		this.pos = entity.position
	}

	getPos() {
		return this.pos.copy()
	}

	get x() {
		return this.pos.x
	}

	get y() {
		return this.pos.y
	}

	get z() {
		return this.pos.z
	}

}
