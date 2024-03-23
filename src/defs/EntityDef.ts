import { Attribute, isAttribute } from "../AttributeList.js"
import { isInRangeIncl, isObject, validateArray, validateProperty } from "../util/typecheck.js"
import Base from "./Base.js"
import TinyError from "../TinyError.js"

export default class EntityDef extends Base {

	readonly hasFriction: boolean
	readonly attributes: Attribute[]
	readonly eyeHeight: number

	constructor(namespace: string, idname: string, data: unknown) {
		super(namespace, idname)
		try {
			if (!validate(data)) throw new Error(`Invalid entitydef for ${namespace}:${idname}: ${JSON.stringify(data)}`)
		} catch (e) {
			// @ts-expect-error e should be an Error
			throw new TinyError(`Invalid entitydef for ${namespace}:${idname}`, e)
		}

		this.hasFriction = data.hasFriction
		this.attributes = data.attributes
		this.eyeHeight = data.eyeHeight
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}.png`
	}

}

export type EntityDefData = {
	hasFriction: boolean,
	attributes: Attribute[],
	eyeHeight: number
}

function validate(data: unknown): data is EntityDefData {
	if (!isObject(data)) throw new Error(`expected an object but got${data}`)

	validateProperty(data, "hasFriction", "boolean", false)
	validateProperty(data, "attributes", validateArray(isAttribute), [])
	validateProperty(data, "eyeHeight", isInRangeIncl(0, 1), 0.5)

	return true
}
