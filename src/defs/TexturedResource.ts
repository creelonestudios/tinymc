import Base from "./Resource.js"
import { getTexture } from "../main.js"
import { NamespacedId } from "../util/interfaces.js"
import Texture from "../texture/Texture.js"

export default class TexturedResource extends Base {

	readonly texture: Texture | null

	constructor(id: NamespacedId) {
		super(id)

		if (this.id.matches("tiny:air", "tiny:player", "tiny:item")) this.texture = null
		else this.texture = getTexture(this.assetsPath)
	}

	get assetsPath() {
		return ""
	}

}
