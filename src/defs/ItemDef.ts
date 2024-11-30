import { isIntInRange, isObject, safeValidateProperty } from "../util/typecheck.js"
import { NamespacedId } from "../util/interfaces.js"
import TexturedResource from "./TexturedResource.js"
import YSON from "https://j0code.github.io/yson/YSON.js"

export default class ItemDef extends TexturedResource {

	readonly maxItemStack: number

	constructor(id: NamespacedId, data: unknown) {
		super(id)
		if (!isObject(data) || !safeValidateProperty(data, "maxItemStack", isIntInRange(1, 9999), 128)) {
			throw new Error(`Invalid itemdef for ${id}: ${YSON.stringify(data)}`)
		}

		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.id.namespace}/textures/item/${this.id.path}.png`
	}

}
