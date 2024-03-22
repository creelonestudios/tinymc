import Graphics from "../Graphics.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import { game, getTexture, input } from "../main.js"
import Subtexture from "../texture/Subtexture.js"
import Texture from "../texture/Texture.js"
import BoundingBox from "../util/BoundingBox.js"
import EventEmitter from "../util/EventEmitter.js"
import TextRenderer from "../util/TextRenderer.js"

let widgetsTex: Texture
let buttonTex: Subtexture
let hoverButtonTex: Subtexture
let clickButtonTex: Subtexture

export class Button extends EventEmitter {

	readonly boundingBox: BoundingBox

	constructor(readonly x: number, readonly y: number, readonly w: number, readonly h: number, readonly text: string) {
		super()
		this.boundingBox = new BoundingBox(new Dim3(x - w/2, y + h/2, 0), new Dim2(w, h))
	}

	static loadTexture() {
		widgetsTex = getTexture("tiny/textures/gui/widgets.png")
		buttonTex = widgetsTex.getSubtexture(0, 66, 200, 20)
		hoverButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20)
		clickButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20)
	}

	draw(g: Graphics) {
		const touching = this.isHovered()
		const tex = touching ? (false ? clickButtonTex : hoverButtonTex) : buttonTex

		g.save()
		g.ctx.translate(this.x - this.w/2, this.y + this.h/2)
		tex.draw(g, this.w, this.h, true)
		g.ctx.textAlign = "center"
		g.ctx.textBaseline = "middle"
		TextRenderer.drawText(g.ctx, this.text, this.w/2, this.h/2, {
			font: { size: 40 },
			color: "white"
		})
		//g.ctx.fillText(this.text, 400, 100)
		g.restore()
	}

	isHovered() {
		const mouse = input.mouse
		mouse.x -= game.width/2
		return this.boundingBox.touch(mouse)
	}

	click(button: number) {
		if (button == 0 && this.isHovered()) this.emit("click")
	}
}