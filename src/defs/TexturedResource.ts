import Base from "./Resource.js"
import { getTexture } from "../main.js"
import Texture from "../texture/Texture.js"

export default class TexturedResource extends Base {

	readonly texture: Texture | null

	constructor(namespace: string, idname: string) {
		super(namespace, idname)

		if (["tiny:air", "tiny:player", "tiny:item"].includes(this.id)) this.texture = null
		else this.texture = getTexture(this.assetsPath)
	}

	get assetsPath() {
		return ""
	}

}
