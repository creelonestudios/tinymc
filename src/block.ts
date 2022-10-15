import Texture from "./texture";

export default class Block {
	#namespace: string;
	#id: string;
	texture: Texture | null;

	static fromYSON(x: any) {
		if (x instanceof Array && x.length == 2) return new Block(x[0], x[1])
	}

	constructor(namespace: string, id: string, texture?: Texture) {
		this.#namespace = namespace
		this.#id = id
		this.texture = texture || null
	}

	get id() {
		return this.#namespace + ":" + this.#id
	}

	get assetsPath() {
		return `${this.#namespace}/textures/block/${this.#id}.png`
	}

}
