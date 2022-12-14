import Dim2 from "./dim2.js"
import EventEmitter from "./EventEmitter.js"

export default class Input extends EventEmitter {

	private keys: Map<string, boolean>
	private mousePos: Dim2

	constructor() {
		super()
		this.keys = new Map()
		this.mousePos = new Dim2()
		window.addEventListener("keydown", e => {
			this.keys.set(e.code, true)
			this.emit("keydown", e.code)
		})
		window.addEventListener("keyup", e => {
			this.keys.set(e.code, false)
			this.emit("keyup", e.code)
		})
		window.addEventListener("mousemove", e => {
			this.mousePos.x = e.x
			this.mousePos.y = e.y
			this.emit("mousemove")
		})
		window.addEventListener("click", e => {
			this.emit("click", e.button)
			e.preventDefault()
		})
		window.addEventListener("contextmenu", e => {
			this.emit("click", 1)
			e.preventDefault()
		})
	}

	get mouseX() {
		return this.mousePos.x
	}

	get mouseY() {
		return this.mousePos.y
	}

	pressed(code: string) {
		return this.keys.get(code) || false
	}

}