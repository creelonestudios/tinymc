import Dim2 from "./dim2.js"
import Dim3 from "./dim3.js"

export default class BoundingBox {

	readonly pos: Dim3
	readonly size: Dim2

	constructor(pos: Dim3, size: Dim2) {
		this.pos  = pos
		this.size = size
	}

	get corner() {
		return new Dim3(this.pos.x + this.size.x, this.pos.y + this.size.y)
	}

	intersect(other: BoundingBox): boolean {
		return this.pos.x < other.corner.x && other.pos.x < this.corner.x && this.corner.y > other.pos.y && other.corner.y > this.pos.y
	}

}