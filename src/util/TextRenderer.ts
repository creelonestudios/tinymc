export default class TextRenderer {

	static drawText(ctx: CanvasRenderingContext2D, text: string, x: number = 0, y: number = 0, options?: TextRenderingOptions) {
		const { color = ctx.fillStyle || "white", opacity = 1, bgOpacity = 0.35, font = {}, drawBg = false } = options || {}
		const { padding = drawBg ? 1 : 0 } = options || {}
		font.family = font.family || "sans-serif"
		font.size   = font.size   || 16
		if (text.trim() == "") return font.size + 2 * padding

		ctx.save()
		ctx.font = `${font.size}px ${font.family}`
		const textWidth = ctx.measureText(text).width

		if (drawBg) {
			if (!["left", "right"].includes(ctx.textAlign)) ctx.textAlign = "left" // required or bg is off
			if (!["top", "bottom"].includes(ctx.textAlign)) ctx.textBaseline = "top" // required or bg is off
			ctx.fillStyle = "black"
			ctx.globalAlpha = opacity * bgOpacity

			let x = 0, y = 0
			let width = textWidth + 2 * padding
			let height = font.size + 2 * padding
			if (ctx.textAlign == "right") {
				x -= textWidth + 2 * padding
			}

			ctx.fillRect(x, y, width, height)
		}

		ctx.fillStyle = color
		ctx.globalAlpha = opacity
		ctx.fillText(text, x + (ctx.textAlign == "left" ? padding : -padding), y + (ctx.textBaseline == "top" ? padding : -padding))

		ctx.restore()

		return font.size + 2 * padding
	}

}

export type TextRenderingOptions = {
	color?: string,
	opacity?: number,
	bgOpacity?: number,
	font?: {
		family?: string,
		size?: number
	},
	padding?: number,
	drawBg?: boolean
}