import Graphics from "../Graphics.js"
import Input from "../Input.js"
import { getTexture, input } from "../main.js"
import Subtexture from "../texture/Subtexture.js"
import Texture from "../texture/Texture.js"
import TextRenderer from "../util/TextRenderer.js"
import { getMousePos } from "./state/ingame.js"

let widgetsTex: Texture
let buttonTex: Subtexture
let hoverButtonTex: Subtexture
let clickButtonTex: Subtexture

export class Button {
	x: number
	y: number
	w: number
	h: number
	text: string

	constructor(x: number, y: number, w: number, h: number, text: string) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.text = text
	}

	static loadTexture() {
		widgetsTex = getTexture("tiny/textures/gui/widgets.png")
		buttonTex = widgetsTex.getSubtexture(0, 66, 200, 20)
		hoverButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20)
		clickButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20)
	}

	static touchingRect(x: number, y: number, w: number, h: number) {
		let mouse = getMousePos()
		return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h
	}

	draw(g: Graphics) {
		const touching = Button.touchingRect(this.x, this.y, this.w, this.h)
		const tex = touching ? false ? clickButtonTex : hoverButtonTex : buttonTex

		g.save()
		g.ctx.translate(this.x, this.y)
		tex.draw(g, this.w, this.h, true)
		g.ctx.textAlign = "center"
		TextRenderer.drawText(g.ctx, this.text, 400, 100, {
			font: {
				family: "default regular",
				size: 50
			},
			color: "white"
		})
		//g.ctx.fillText(this.text, 400, 100)
		g.restore()
	}
}