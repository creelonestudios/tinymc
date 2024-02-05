import Graphics from "../Graphics.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"

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

	touch(point: Dim2 | Dim3) {
		const t = point.x >= this.pos.x && point.x <= this.corner.x && point.y >= this.pos.y && point.y <= this.corner.y
		// if (t) console.log(this, point, point.x >= this.pos.x, point.x <= this.corner.x, point.y >= this.pos.y, point.y <= this.corner.y)
		return t
	}

	draw(g: Graphics, color: string) {
		g.save()
		g.translate(this.pos.x, this.pos.y)

		g.strokeStyle = color
		g.lineWidth = 1
		g.strokeRect(this.size.x, this.size.y)

		g.restore()
	}

}
