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
