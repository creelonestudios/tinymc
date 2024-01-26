import Graphics from "../Graphics";
import Input from "../Input";
import { getMousePos, getTexture, input } from "../main.js";
import Subtexture from "../texture/Subtexture";
import Texture from "../texture/Texture";

let widgetsTex: Texture;
let buttonTex: Subtexture;
let hoverButtonTex: Subtexture;
let clickButtonTex: Subtexture;

export class Button {
	x: number; y: number; w: number; h: number; text: string

	constructor(x: number, y: number, w: number, h: number, text: string) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.text = text
	}

	static loadTexture() {
		widgetsTex = getTexture("tiny/textures/gui/widgets.png")
		buttonTex = widgetsTex.getSubtexture(0, 66, 200, 20);
		hoverButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20);
		clickButtonTex = widgetsTex.getSubtexture(0, 86, 200, 20);
	}

	static touchingRect(x: number, y: number, w: number, h: number) {
		let mouse = getMousePos();
		return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
	}

	draw(graphics: Graphics) {
		const touching = Button.touchingRect(this.x, this.y, this.w, this.h);
		const tex = touching ? false ? clickButtonTex : hoverButtonTex : buttonTex;
		graphics.save();
		graphics.ctx.translate(this.x, this.y);
		tex.draw(graphics, this.w, this.h, true);
		graphics.ctx.fillStyle = "white";
		graphics.ctx.font = "50px Minecraft Regular";
		// graphics.ctx.textAlign = "center";
		graphics.ctx.fillText(this.text, 400, 100);
		graphics.restore();
	}
}