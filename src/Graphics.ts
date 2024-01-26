export default class Graphics {

	readonly ctx: CanvasRenderingContext2D

	constructor(private readonly canvas: HTMLCanvasElement, private readonly blockSize: number) {
		this.ctx = canvas.getContext("2d")!
	}

	get fillStyle()   { return this.ctx.fillStyle }
	get strokeStyle() { return this.ctx.strokeStyle }
	get lineWidth()   { return this.ctx.lineWidth }
	get globalAlpha() { return this.ctx.globalAlpha }

	set fillStyle(x)   { this.ctx.fillStyle = x }
	set strokeStyle(x) { this.ctx.strokeStyle = x }
	set lineWidth(x)   { this.ctx.lineWidth = x }
	set globalAlpha(x) { this.ctx.globalAlpha = x }

	brightness(x: number)  {
		this.ctx.filter = `brightness(${x})`
	}

	save() { this.ctx.save() }
	restore() { this.ctx.restore() }
	
	reset() {
		this.canvas.width  = innerWidth
		this.canvas.height = innerHeight
		this.canvas.style.width  = innerWidth  + "px"
		this.canvas.style.height = innerHeight + "px"

		this.ctx.reset()
		this.ctx.imageSmoothingEnabled = false
		this.ctx.fillStyle = "#78A7FF"
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		this.ctx.translate(this.canvas.width/2, this.canvas.height/2) // center game
	}


	translate(x: number, y: number) {
		this.ctx.translate(x * this.blockSize, -y * this.blockSize)
	}

	strokeRect(w: number = 1, h: number = 1) {
		this.ctx.strokeRect(0, 0, w * this.blockSize, -h * this.blockSize)
	}

	drawText(text: string, options?: { color?: string, opacity?: number, bgOpacity?: number, font?: { family?: string, size?: number }, padding?: number, drawBg?: boolean }) { // TODO: replace with game font
		const ctx = this.ctx
		const { color = ctx.fillStyle || "white", opacity = 1, bgOpacity = 0.35, font = {}, padding = 1, drawBg = false } = options || {}
		font.family = font.family || "sans-serif"
		font.size   = font.size   || 16
		if (text.trim() == "") return font.size + 2 * padding

		ctx.save()
		ctx.font = `${font.size}px ${font.family}`
		ctx.textAlign = "left"
		ctx.textBaseline = "top"
		const textWidth = ctx.measureText(text).width

		if (drawBg) {
			ctx.fillStyle = "black"
			ctx.globalAlpha = opacity * bgOpacity
			ctx.fillRect(0, 0, textWidth + 2 * padding, font.size + 2 * padding)
		}

		ctx.fillStyle = color
		ctx.globalAlpha = opacity
		ctx.fillText(text, padding, padding)

		ctx.restore()

		return font.size + 2 * padding
	}

	drawImage(image: CanvasImageSource, w: number = 1, h: number = 1) {
		this.ctx.drawImage(image, 0, 0, w * this.blockSize, -h * this.blockSize)
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
