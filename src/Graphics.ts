import LightColor from "./util/LightColor.js"
import TextRenderer, { type TextRenderingOptions } from "./util/TextRenderer.js"

export default class Graphics {

	readonly ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

	private filters: {
		brightness?: number,
		blur?: number
	}

	private filterSaves: ({
		brightness?: number,
		blur?: number
	})[]

	constructor(readonly canvas: HTMLCanvasElement | OffscreenCanvas, private readonly blockSize: number) {
		this.ctx = canvas.getContext("2d", { alpha: false })!
		this.filters = {}
		this.filterSaves = []
	}

	get fillStyle()   { return this.ctx.fillStyle }
	get strokeStyle() { return this.ctx.strokeStyle }
	get lineWidth()   { return this.ctx.lineWidth }
	get globalAlpha() { return this.ctx.globalAlpha }

	set fillStyle(x)   { this.ctx.fillStyle = x }
	set strokeStyle(x) { this.ctx.strokeStyle = x }
	set lineWidth(x)   { this.ctx.lineWidth = x }
	set globalAlpha(x) { this.ctx.globalAlpha = x }

	brightness(x?: number)  {
		this.filters.brightness = x
		this.applyFilters()
	}

	blur(x?: number)  {
		this.filters.blur = x
		this.applyFilters()
	}

	private applyFilters() {
		const filter: string[] = []

		if (this.filters.brightness != undefined) {
			filter.push(`brightness(${this.filters.brightness})`)
		}
		if (this.filters.blur != undefined) {
			filter.push(`blur(${this.filters.blur}px)`)
		}

		this.ctx.filter = filter.join(" ")
	}

	save() {
		this.ctx.save()
		this.filterSaves.push(structuredClone(this.filters))
	}

	restore() {
		this.ctx.restore()
		this.filters = this.filterSaves.pop() || {}
		this.applyFilters()
	}

	reset() {
		this.ctx.reset()
		this.filters = {}
		this.filterSaves = []
		this.applyFilters()
		this.ctx.imageSmoothingEnabled = false
		this.ctx.fillStyle = "#78A7FF"
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}


	translate(x: number, y: number) {
		this.ctx.translate(x * this.blockSize, -y * this.blockSize)
	}

	strokeRect(w: number = 1, h: number = 1) {
		this.ctx.strokeRect(0, 0, w * this.blockSize, -h * this.blockSize)
	}

	drawText(text: string, options?: TextRenderingOptions) {
		return TextRenderer.drawText(this.ctx, text, 0, 0, options)
	}

	drawImage(image: CanvasImageSource, w: number = 1, h: number = 1, light?: LightColor) {
		this.ctx.save()

		if (light) {
			this.ctx.fillStyle = light.toString()
			this.ctx.fillRect(0, 0, w * this.blockSize, -h * this.blockSize)
			this.ctx.globalCompositeOperation = "multiply"
		}

		this.ctx.drawImage(image, 0, 0, w * this.blockSize, -h * this.blockSize)
		this.ctx.restore()
	}

	drawPartialImage(image: CanvasImageSource, sx: number, sy: number, sWidth: number, sHeight: number, dWidth: number = 1, dHeight: number = 1) {
		this.ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth * this.blockSize, -dHeight * this.blockSize)
	}

	globalDrawImage(image: CanvasImageSource, w: number = 1, h: number = 1) {
		this.ctx.drawImage(image, 0, 0, w, h)
	}

	globalDrawPartialImage(image: CanvasImageSource, sx: number, sy: number, sWidth: number, sHeight: number, dWidth: number = 1, dHeight: number = 1) {
		this.ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)
	}

}
