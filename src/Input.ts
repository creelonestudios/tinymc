import Dim2 from "./dim/Dim2.js"
import EventEmitter from "./util/EventEmitter.js"

export default class Input extends EventEmitter {

	private keys: Map<string, boolean>
	private mousePos: Dim2

	constructor() {
		super()
		this.keys = new Map()
		this.mousePos = new Dim2()
		window.addEventListener("keydown", e => {
			if (e.code == "F12") return // open devtools
			if (e.code == "F5") {
				// TODO: save game beforehand!
				return // default (reload) not prevented
			}

			this.keys.set(e.code, true)
			this.emit("keydown", e.code)
			e.preventDefault()
		})
		window.addEventListener("keyup", e => {
			this.keys.set(e.code, false)
			this.emit("keyup", e.code)
			e.preventDefault()
		})
		window.addEventListener("mousemove", e => {
			this.mousePos.x = e.x
			this.mousePos.y = e.y
			this.emit("mousemove")
		})
		window.addEventListener("mousedown", e => {
			this.emit("click", e.button)
			e.preventDefault()
		})
		window.addEventListener("contextmenu", e => {
			e.preventDefault()
		})
		window.addEventListener("wheel", e => {
			//e.preventDefault()
		})
	}

	get mouseX() {
		return this.mousePos.x
	}

	get mouseY() {
		return this.mousePos.y
	}

	get mouse() {
		return this.mousePos.copy()
	}

	pressed(code: string) {
		return this.keys.get(code) || false
	}

}
