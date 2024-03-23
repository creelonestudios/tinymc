import Dim from "./Dim.js"
import Dim2 from "./Dim2.js"

export default class Dim3 implements Dim {

	x: number
	y: number
	z: number

	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	add(dim: Dim2 | Dim3): Dim3 {
		this.x += dim.x
		this.y += dim.y
		if (dim instanceof Dim3) this.z += dim.z

		return this
	}

	sub(dim: Dim2 | Dim3): Dim3 {
		this.x -= dim.x
		this.y -= dim.y
		if (dim instanceof Dim3) this.z -= dim.z

		return this
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	mult(dim: Dim3): Dim3 {
		return this
	}

	set(dim: Dim2 | Dim3 | number, y?: number, z?: number): Dim3 {
		if (dim instanceof Dim2 || dim instanceof Dim3) {
			this.x = dim.x
			this.y = dim.y
			if (dim instanceof Dim3) this.z = dim.z
		} else {
			this.x = dim
			this.y = y || 0
			this.z = z || 0
		}

		return this
	}

	scale(x: number): Dim3 {
		this.x *= x
		this.y *= x
		this.z *= x

		return this
	}

	dot(dim: Dim2 | Dim3): number {
		if (dim instanceof Dim2) return this.x * dim.x + this.y * dim.y

		return this.x * dim.x + this.y * dim.y + this.z * dim.z
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

	normalize(): Dim3 {
		const mag = this.mag()

		if (mag == 0) return this

		return this.scale(1/mag)
	}

	distanceTo(other: Dim2 | Dim3): number {
		return this.copy().sub(other).mag()
	}

	floor(): Dim3 {
		this.x = Math.floor(this.x)
		this.y = Math.floor(this.y)
		this.z = Math.floor(this.z)

		return this
	}

	copy(): Dim3 {
		return new Dim3(this.x, this.y, this.z)
	}

	asArray() {
		return [this.x, this.y, this.z]
	}

}
