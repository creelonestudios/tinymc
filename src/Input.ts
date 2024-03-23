import Dim2 from "./dim/Dim2.js"
import EventEmitter from "./util/EventEmitter.js"

export default class Input extends EventEmitter {

	private readonly keys: Set<string>
	private readonly mouseButtons: Set<number>
	private readonly mousePos: Dim2

	constructor() {
		super()
		this.keys = new Set()
		this.mouseButtons = new Set()
		this.mousePos = new Dim2()

		window.addEventListener("keydown", e => {
			if (e.code == "F12") return // open devtools
			if (e.code == "F5") {
				// TODO: save game beforehand!
				return // default (reload) not prevented
			}

			const before = this.keys.has(e.code)

			this.keys.add(e.code)
			if (!before) this.emit("keydown", e.code)

			this.emit("keypress", e.code)
			e.preventDefault()
		})

		window.addEventListener("keyup", e => {
			this.keys.delete(e.code)
			this.emit("keyup", e.code)
			e.preventDefault()
		})

		window.addEventListener("mousemove", e => {
			this.mousePos.x = e.x
			this.mousePos.y = e.y
			this.emit("mousemove")
		})

		window.addEventListener("mousedown", e => {
			this.mouseButtons.add(e.button)
			this.emit("click", e.button)
			e.preventDefault()
		})

		window.addEventListener("mouseup", e => {
			this.mouseButtons.delete(e.button)
			e.preventDefault()
		})

		window.addEventListener("contextmenu", e => {
			e.preventDefault()
		})

		window.addEventListener("wheel", () => {
			// e.preventDefault()
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

	keyPressed(code: string) {
		return this.keys.has(code)
	}

	mousePressed(button: number) {
		return this.mouseButtons.has(button)
	}

}
