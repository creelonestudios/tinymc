import { assertObject, isIntInRange, validateProperty } from "../util/typecheck.js"
import { NamespacedId } from "../util/interfaces.js"
import TexturedResource from "./TexturedResource.js"
import YSON from "https://j0code.github.io/yson/YSON.js"

export default class ItemDef extends TexturedResource {

	readonly maxItemStack: number

	constructor(id: NamespacedId, data: unknown) {
		super(id)

		try {
			assertObject(data)
			validateProperty(data, "maxItemStack", isIntInRange(1, 9999), 128)
		} catch (e) {
			// @ts-expect-error e should be an Error
			throw new TinyError(`Invalid itemdef for ${id}: ${YSON.stringify(data)}`, e)
		}

		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.id.namespace}/textures/item/${this.id.path}.png`
	}

}
