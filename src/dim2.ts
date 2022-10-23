import Dim from "./dim"

export default class Dim2 implements Dim {
	
	x: number
	y: number

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(dim: Dim2): Dim2 {
		this.x += dim.x
		this.y += dim.y
		return this
	}

	mult(dim: Dim2): Dim2 {
		return this
	}

	set(dim: Dim2 | number, y?: number): Dim2 {
		if (dim instanceof Dim2) {
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

	copy() {
		return new Dim2(this.x, this.y)
	}

	asArray() {
		return [this.x, this.y]
	}

}