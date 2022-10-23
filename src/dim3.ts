import Dim from "./dim.js"

export default class Dim3 implements Dim {
	
	x: number
	y: number
	z: number

	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	add(dim: Dim3): Dim3 {
		this.x += dim.x
		this.y += dim.y
		this.z += dim.z
		return this
	}

	mult(dim: Dim3): Dim3 {
		return this
	}

	set(dim: Dim3 | number, y?: number, z?: number): Dim3 {
		if (dim instanceof Dim3) {
			this.x = dim.x
			this.y = dim.y
			this.z = dim.z
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

	copy() {
		return new Dim3(this.x, this.y, this.z)
	}

	asArray() {
		return [this.x, this.y, this.z]
	}

}