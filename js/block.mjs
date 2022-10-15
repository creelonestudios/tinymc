export default class Block {

	static fromYSON(x) {
		if (x instanceof Array && x.length == 2) return new Block(x[0], x[1])
	}

	#namespace; #id
	constructor(namespace, id, texture) {
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

	get color() {
		return "red"
	}

}
