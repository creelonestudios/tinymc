import Dim from "./Dim.js"
import Dim3 from "./Dim3.js"

export default class Dim2 implements Dim {

	static polar(theta: number, scale: number = 1) {
		return new Dim2(Math.cos(theta) * scale, Math.sin(theta) * scale)
	}

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
		this.x = this.x * dim.x - this.y * dim.y
		this.y = this.x * dim.y + this.x * dim.x

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

	rotate(theta: number): Dim2 {
		const vec = Dim2.polar(theta)

		this.mult(vec)

		return this
	}

	dot(dim: Dim2 | Dim3): number {
		return this.x * dim.x + this.y * dim.y
	}

	sqMag(): number {
		return this.dot(this)
	}

	mag(): number {
		return Math.sqrt(this.sqMag())
	}

	angle(): number {
		return Math.acos(this.dot(new Dim2(1, 0)) / this.mag()) * Math.sign(this.y)
	}

	normalize(): Dim2 {
		const mag = this.mag()

		if (mag == 0) return this

		return this.scale(1/mag)
	}

	distanceTo(other: Dim2 | Dim3): number {
		return this.copy().sub(other).mag()
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
