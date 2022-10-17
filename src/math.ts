import { mouse, mouseDown } from "./main.js";

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
}