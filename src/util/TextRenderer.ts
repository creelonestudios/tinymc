const SHADOW_BRIGHTNESS = "0.314"

export default class TextRenderer {

	static drawText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string, x: number = 0, y: number = 0, options?: TextRenderingOptions) {
		const {
			color = ctx.fillStyle || "white",
			opacity = 1, bgOpacity = 0.35,
			font = {},
			drawBg = false,
			shadow = true,
			underline = false,
			overline = false,
			strikethrough = false
		} = options || {}
		const { padding = drawBg ? 1 : 0 } = options || {}

		font.family  ||= "tinymc"
		font.size    ||= 16
		font.weight  ||= "normal"
		font.style   ||= "normal"
		font.variant ||= ""
		if (text.trim() == "") return font.size + 2 * padding

		ctx.save()
		ctx.font = `${font.style} ${font.weight} ${font.variant} ${font.size}px "${font.family}"`
		const textWidth = ctx.measureText(text).width

		if (drawBg) {
			if (!["left", "right"].includes(ctx.textAlign)) ctx.textAlign = "left" // required or bg is off
			if (!["top", "bottom"].includes(ctx.textBaseline)) ctx.textBaseline = "top" // required or bg is off

			ctx.fillStyle = "black"
			ctx.globalAlpha = opacity * bgOpacity

			let bgX = 0
			let bgY = 0
			const width = textWidth + 2 * padding
			const height = font.size + 2 * padding

			if (ctx.textAlign == "right")     bgX -= textWidth + 2 * padding
			if (ctx.textBaseline == "bottom") bgY -= font.size + 2 * padding

			ctx.fillRect(bgX, bgY, width, height)
		}

		ctx.globalAlpha = opacity
		ctx.fillStyle = color

		const textX = x + (ctx.textAlign == "left" ? padding : -padding)
		const textY = y + (ctx.textBaseline == "top" ? padding : -padding)
		const unit = font.size / 10

		if (shadow) {
			ctx.save()
			ctx.filter = `brightness(${SHADOW_BRIGHTNESS})`
			drawDecoratedText(ctx, text, textX + unit, textY + unit, unit, textWidth, underline, overline, strikethrough)
			ctx.restore()
		}

		drawDecoratedText(ctx, text, textX, textY, unit, textWidth, underline, overline, strikethrough)

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
		style?: "normal" | "italic",
		variant?: string // https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
	},
	padding?: number,
	drawBg?: boolean,
	shadow?: boolean,
	underline?: boolean,
	overline?: boolean,
	strikethrough?: boolean
}

function drawDecoratedText(
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	unit: number,
	textWidth: number,
	underline: boolean,
	overline: boolean,
	strikethrough: boolean
) {
	ctx.fillText(text, x, y)

	if (underline) drawLine(ctx, x, y, textWidth, unit)
	if (overline) drawLine(ctx, x, y - unit * 10, textWidth, unit)
	if (strikethrough) drawLine(ctx, x, y - unit * 5, textWidth, unit)
}

function drawLine(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
	if (ctx.textAlign == "right") x -= width
	 else if (ctx.textAlign == "center") x -= width / 2


	if (ctx.textBaseline == "top") y += height * 9
	 else if (ctx.textBaseline == "middle") y += height * 4
	 else if (ctx.textBaseline == "alphabetic") y += height
	 else if (ctx.textBaseline == "bottom" || ctx.textBaseline == "ideographic") y -= height


	ctx.fillRect(x, y, width, height)
}
