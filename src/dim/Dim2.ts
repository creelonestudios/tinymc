import Dim from "./Dim.js"
import Dim3 from "./Dim3.js"

export default class Dim2 implements Dim {
	
	x: number
	y: number

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(dim: Dim2 | Dim3): Dim2 {
		this.x += dim.x
		this.y += dim.y
		return this
	}

	sub(dim: Dim2 | Dim3): Dim2 {
		this.x -= dim.x
		this.y -= dim.y
		return this
	}

	mult(dim: Dim2): Dim2 {
		return this
	}

	set(dim: Dim2 | Dim3 | number, y?: number): Dim2 {
		if (dim instanceof Dim2 || dim instanceof Dim3) {
			this.x = dim.x
			this.y = dim.y
		} else {
			this.x = dim
			this.y = y || 0
		}
		return this
	}

	scale(x: number): Dim2 {
		this.x *= x
		this.y *= x
		return this
	}

	sqMag(): number {
		return this.x ** 2 + this.y ** 2
	}

	mag(): number {
		return Math.sqrt(this.sqMag())
	}

	normalize(): Dim2 {
		const mag = this.mag()
		return this.scale(1/mag)
	}

	floor(): Dim2 {
		this.x = Math.floor(this.x)
		this.y = Math.floor(this.y)
		return this
	}

	copy(): Dim2 {
		return new Dim2(this.x, this.y)
	}

	asArray() {
		return [this.x, this.y]
	}

}
