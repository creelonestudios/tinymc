import { isIntInRange } from "./typecheck.js"

const rangeCheck = isIntInRange(0, 16)

export default class LightColor {

	static max(lights: LightColor[]) {
		let maxRed   = 0
		let maxGreen = 0
		let maxBlue  = 0

		lights.forEach(color => {
			if (color.red   > maxRed)   maxRed   = color.red
			if (color.green > maxGreen) maxGreen = color.green
			if (color.blue  > maxBlue)  maxBlue  = color.blue
		})

		return new LightColor(maxRed, maxGreen, maxBlue)
	}

	readonly red: number
	readonly green: number
	readonly blue: number

	constructor(red: number, green: number, blue: number) {
		this.red   = rangeCheck(red)   ? red   : 0
		this.green = rangeCheck(green) ? green : 0
		this.blue  = rangeCheck(blue)  ? blue  : 0
	}

	get level() {
		return Math.floor((this.red + this.green + this.blue) / 3)
	}

	get debug() {
		return `${this.red} ${this.green} ${this.blue}`
	}

	max(other: LightColor) {
		return new LightColor(Math.max(this.red, other.red), Math.max(this.green, other.green), Math.max(this.blue, other.blue))
	}

	multiply(other: LightColor) {
		const red   = (this.red   * other.red)   / 15
		const green = (this.green * other.green) / 15
		const blue  = (this.blue  * other.blue)  / 15

		return new LightColor(red, green, blue)
	}

	scale(x: number) {
		x /= 15

		return new LightColor(Math.floor(this.red * x), Math.floor(this.green * x), Math.floor(this.blue * x))
	}

	decrement() {
		return new LightColor(this.red - 1, this.green - 1, this.blue - 1)
	}

	equals(other: LightColor) {
		return this.red == other.red && this.green == other.green && this.blue == other.blue
	}

	toString() {
		const r = (this.red   * 17).toString(16).padStart(2, "0")
		const g = (this.green * 17).toString(16).padStart(2, "0")
		const b = (this.blue  * 17).toString(16).padStart(2, "0")

		return `#${r}${g}${b}`
	}

}
