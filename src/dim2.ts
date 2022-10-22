export default class Dim2 {
	
	x: number
	y: number

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(dim: Dim2) {
		this.x += dim.x
		this.y += dim.y
	}

	set(dim: Dim2) {
		this.x = dim.x
		this.y = dim.y
	}

	copy() {
		return new Dim2(this.x, this.y)
	}

	asArray() {
		return [this.x, this.y]
	}

}