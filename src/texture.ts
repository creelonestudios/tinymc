import { blockSize } from "./main.js";
import Subtexture from "./subtexture.js";

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

	draw(ctx: CanvasRenderingContext2D) {
		if (!this.ready) return
		ctx.save()
		ctx.drawImage(this.image, 0, 0, 1, 1)
		ctx.restore()
	}

	getSubtexture(x: number, y: number, w: number, h: number) {
		return new Subtexture(this, x, y, w, h)
	}

	drawMap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
		if (!this.ready) return

		ctx.save()
		ctx.drawImage(this.image, x, y, w, h, 0, 0, 1, 1)
		ctx.restore()
	}

}
