import Graphics from "../Graphics.js"
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

	draw(g: Graphics, w?: number, h?: number, global: boolean = false): void {
		this.texture.drawMap(g, this.offset.x, this.offset.y, this.size.x, this.size.y, w, h, global)
	}

}
