import Graphics from "../Graphics.js"
import Subtexture from "./Subtexture.js";

export default class Texture {

	static LOADING = 0
	static LOADED  = 1
	static FAILED  = 2

	private image: HTMLImageElement
	#state: number

	constructor(path: string) {
		const img = new Image()
		img.addEventListener("load", () => {
			this.#state = Texture.LOADED
		})
		img.addEventListener("error", e => {
			this.#state = Texture.FAILED
			console.error(`Texture "${path}" failed to load:`, e)
		})
		img.src = "./assets/" + path

		this.image = img
		this.#state = Texture.LOADING
	}

	get state() {
		return this.#state
	}

	ready() {
		return this.#state == Texture.LOADED
	}

	draw(g: Graphics, w?: number, h?: number, global: boolean = false) {
		if (!this.ready) return
		if (global) g.globalDrawImage(this.image, w, h)
		else g.drawImage(this.image, w, h)
	}

	getSubtexture(x: number, y: number, w: number, h: number) {
		return new Subtexture(this, x, y, w, h)
	}

	drawMap(g: Graphics, x: number, y: number, w: number, h: number, dw?: number, dh?: number, global: boolean = false) {
		if (!this.ready) return
		if (global) g.globalDrawPartialImage(this.image, x, y, w, h, dw, dh)
		else g.drawPartialImage(this.image, x, y, w, h, dw, dh)
	}

}
