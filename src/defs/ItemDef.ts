import { isInteger, isObject, safeValidateProperty } from "../util/typecheck.js"
import Base from "./Base.js"

export default class ItemDef extends Base {

	readonly maxItemStack: number

	constructor(namespace: string, idname: string, data: unknown) {
		super(namespace, idname)
		if (!isObject(data) || !safeValidateProperty(data, "maxItemStack", isInteger, 128)) {
			throw new Error(`Invalid itemdef for ${namespace}:${idname}: ${JSON.stringify(data)}`)
		}

		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.namespace}/textures/item/${this.idname}.png`
	}

}
