import { mouse, mouseDown } from "./main.js";
import Texture from "./texture.js";

export class MathUtils {
	static lerp(start: number, end: number, amount: number) {
		return (1 - amount) * start + amount * end;
	}

	static touchingRect(x: number, y: number, w: number, h: number) {
		return mouse[0] > x && mouse[0] < x + w && mouse[1] > y && mouse[1] < y + h;
	}

	// DrawUtils class, rename this file to utils.ts
	static hoverRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string, hc: string) {
		const touching = this.touchingRect(x, y, w, h);
		ctx.fillStyle = touching ? hc : c;
		ctx.fillRect(x, y, w, h);
		return touching;
	}

	static buttonRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string, hc: string, cc: string) {
		const touching = this.touchingRect(x, y, w, h);
		ctx.fillStyle = touching ? mouseDown ? cc : hc : c;
		ctx.fillRect(x, y, w, h);
		return touching && mouseDown;
	}

	static hoverImg(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tex: Texture, c: TextureCutout, hc: TextureCutout) {
		const touching = this.touchingRect(x, y, w, h);
		const cutout = touching ? hc : c;
		ctx.drawImage(tex.img, cutout.x, cutout.y, cutout.w, cutout.h, x, y, w, h);
		return touching;
	}

	static buttonImg(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tex: Texture, c: TextureCutout, hc: TextureCutout, cc: TextureCutout) {
		const touching = this.touchingRect(x, y, w, h);
		const cutout = touching ? mouseDown ? cc : hc : c;
		ctx.drawImage(tex.img, cutout.x, cutout.y, cutout.w, cutout.h, x, y, w, h);
		return touching && mouseDown;
	}
}

export class TextureCutout {

	x: number;
	y: number;
	w: number;
	h: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

}