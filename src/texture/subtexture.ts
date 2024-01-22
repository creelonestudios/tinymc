import Dim2 from "../dim/dim2.js";
import Texture from "./texture.js";

export default class Subtexture {

	private offset: Dim2
	private size: Dim2
	private texture: Texture

	constructor(texture: Texture, x: number, y: number, w: number, h: number) {
		this.offset = new Dim2(x, y)
		this.size = new Dim2(w, h)
		this.texture = texture
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.texture.drawMap(ctx, this.offset.x, this.offset.y, this.size.x, this.size.y)
	}

}
