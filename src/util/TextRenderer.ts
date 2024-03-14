export default class TextRenderer {

	static drawText(ctx: CanvasRenderingContext2D, text: string, x: number = 0, y: number = 0, options?: TextRenderingOptions) {
		const { color = ctx.fillStyle || "white", opacity = 1, bgOpacity = 0.35, font = {}, drawBg = false, shadow = true } = options || {}
		const { padding = drawBg ? 1 : 0 } = options || {}
		font.family = font.family || "tinymc"
		font.size   = font.size   || 16
		font.weight = font.weight || "normal"
		font.style  = font.style  || "normal"
		if (text.trim() == "") return font.size + 2 * padding

		ctx.save()
		ctx.font = `${font.style} ${font.weight} ${font.size}px ${font.family}`
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

		ctx.globalAlpha = opacity
		ctx.fillStyle = color

		const textX = x + (ctx.textAlign == "left" ? padding : -padding)
		const textY = y + (ctx.textBaseline == "top" ? padding : -padding)

		if (shadow) {
			ctx.save()
			ctx.filter = `brightness(0.314)`
			ctx.fillText(text, textX + font.size / 10, textY + font.size / 10)
			ctx.restore()
		}

		ctx.fillText(text, textX, textY)

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
		size?: number,
		weight?: number | "normal" | "bold" | "lighter" | "bolder",
		style?: "normal" | "italic"
	},
	padding?: number,
	drawBg?: boolean,
	shadow?: boolean
}