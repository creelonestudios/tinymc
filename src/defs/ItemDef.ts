import { isIntInRange, isObject, safeValidateProperty } from "../util/typecheck.js"
import TexturedResource from "./TexturedResource.js"

export default class ItemDef extends TexturedResource {

	readonly maxItemStack: number

	constructor(namespace: string, idname: string, data: unknown) {
		super(namespace, idname)
		if (!isObject(data) || !safeValidateProperty(data, "maxItemStack", isIntInRange(1, 9999), 128)) {
			throw new Error(`Invalid itemdef for ${namespace}:${idname}: ${JSON.stringify(data)}`)
		}

		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.namespace}/textures/item/${this.idname}.png`
	}

}
