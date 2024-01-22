export default class Graphics {

	private readonly ctx: CanvasRenderingContext2D

	constructor(private readonly canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext("2d")!
	}

	get fillStyle()   { return this.ctx.fillStyle }
	get strokeStyle() { return this.ctx.strokeStyle }
	get lineWidth()   { return this.ctx.lineWidth }

	set fillStyle(x)   { this.ctx.fillStyle = x }
	set strokeStyle(x) { this.ctx.strokeStyle = x }
	set lineWidth(x)   { this.ctx.lineWidth = x }

	save() { this.ctx.save() }
	restore() { this.ctx.restore() }
	scale(x: number, y: number) { this.ctx.scale(x, y) }
	
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


	translate(x: number, y: number, global: boolean = false) {
		this.ctx.translate(x, global ? y : -y)
	}

	fillRect(x: number, y: number, w: number, h: number) {
		this.ctx.fillRect(x, y, w, h)
	}

	strokeRect(x: number, y: number, w: number, h: number) {
		this.ctx.strokeRect(x, y, w, h)
	}

	drawImage(image: CanvasImageSource, dx: number, dy: number, dWidth: number, dHeight: number) {
		this.ctx.drawImage(image, dx, dy, dWidth, dHeight)
	}

	drawPartialImage(image: CanvasImageSource, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number) {
		this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	}

}
