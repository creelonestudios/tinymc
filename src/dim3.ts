export default class Dim3 {
	
	x: number
	y: number
	z: number

	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	add(dim: Dim3) {
		this.x += dim.x
		this.y += dim.y
		this.z += dim.z
	}

	set(dim: Dim3) {
		this.x = dim.x
		this.y = dim.y
		this.z = dim.z
	}

	copy() {
		return new Dim3(this.x, this.y, this.z)
	}

	asArray() {
		return [this.x, this.y, this.z]
	}

}