import Texture from "./texture.js"
import { getTexture } from "./main.js"

export default class BlockDef {
	readonly namespace: string;
	readonly idname: string;
	readonly texture: Texture | null;

	constructor(namespace: string, idname: string, data: object) {
		this.namespace = namespace
		this.idname = idname
		
		if (this.id != "tiny:air") {
			this.texture = getTexture(this.assetsPath)
		} else this.texture = null
	}

	get id() {
		return this.namespace + ":" + this.idname
	}

	get assetsPath() {
		return `${this.namespace}/textures/block/${this.idname}.png`
	}

}