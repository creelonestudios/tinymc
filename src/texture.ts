import { blockSize } from "./main.js";

export default class Texture {

	static LOADING = 0
	static LOADED  = 1
	static FAILED  = 2

	#image; #state
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

		this.#image = img
		this.#state = Texture.LOADING
	}

	get img() {
		return this.#image
	}

	get state() {
		return this.#state
	}

	ready() {
		return this.#state == Texture.LOADED
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (!this.ready) return
		ctx.save()
		ctx.scale(1, -1) // flip y-axis
		ctx.drawImage(this.img, 0, -blockSize, blockSize, blockSize)
		ctx.restore()
	}

}
