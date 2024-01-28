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
		this.x += dim.x
		this.y += dim.y
		if (dim instanceof Dim3) this.z += dim.z
		return this
	}

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

	sqMag(): number {
		return this.x ** 2 + this.y ** 2 + this.z ** 2
	}

	mag(): number {
		return Math.sqrt(this.sqMag())
	}

	normalize(): Dim2 {
		const mag = this.mag()
		return this.scale(1/mag)
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
