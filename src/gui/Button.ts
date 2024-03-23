import { game, getSound, getTexture, input } from "../main.js"
import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import EventEmitter from "../util/EventEmitter.js"
import Graphics from "../Graphics.js"
import Sound from "../sound/Sound.js"
import Subtexture from "../texture/Subtexture.js"
import TextRenderer from "../util/TextRenderer.js"
import Texture from "../texture/Texture.js"

let widgetsTex: Texture
let buttonTex: Subtexture
let hoverButtonTex: Subtexture
let clickSound: Sound

export class Button extends EventEmitter {

	readonly boundingBox: BoundingBox

	constructor(readonly x: number, readonly y: number, readonly w: number, readonly h: number, readonly text: string) {
		super()
		this.boundingBox = new BoundingBox(new Dim3(x - w/2, y - h/2, 0), new Dim2(w, h))
	}

	static loadAssets() {
		widgetsTex = getTexture("tiny/textures/gui/widgets.png")
		buttonTex = widgetsTex.getSubtexture(0, 66, 200, 20)
		hoverButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20)
		clickSound = getSound("gui.click")
	}

	draw(g: Graphics) {
		const touching = this.isHovered()
		const tex = touching ? hoverButtonTex : buttonTex

		g.save()
		g.ctx.translate(this.x - this.w/2, this.y - this.h/2)
		tex.draw(g, this.w, this.h, true)
		g.ctx.textAlign = "center"
		g.ctx.textBaseline = "middle"
		TextRenderer.drawText(g.ctx, this.text, this.w/2, this.h/2, {
			font:  { size: this.h/2 },
			color: "white"
		})

		// g.ctx.fillText(this.text, 400, 100)
		g.restore()
	}

	isHovered() {
		const { mouse } = input

		mouse.x -= game.width/2
		mouse.y -= game.height/2

		return this.boundingBox.touch(mouse)
	}

	click(button: number) {
		if (button == 0 && this.isHovered()) {
			clickSound.play()
			this.emit("click")
		}
	}

}
