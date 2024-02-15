import { Attribute, isAttribute } from "../AttributeList.js"
import Base from "./Base.js"

export default class EntityDef extends Base {

	readonly hasFriction: boolean
	readonly attributes: Attribute[]

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		if (!validate(data)) throw new Error(`Invalid entitydef for ${namespace}:${idname}: ${JSON.stringify(data)}`)

		this.hasFriction = data.hasFriction
		this.attributes = data.attributes
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}.png`
	}

}

export type EntityDefData = {
	hasFriction: boolean,
	attributes: Attribute[]
}

function validate(data: any): data is EntityDefData {
	if (typeof data != "object" || data == null) return false
	if ("hasFriction" in data) {
		if (typeof data.hasFriction != "boolean") return false
	} else {
		data.hasFriction = false
	}

	if ("attributes" in data) {
		if (!(data.attributes instanceof Array)) return false
		for (let attr of data.attributes) {
			if (!isAttribute(attr)) return false
		}
	} else {
		data.attributes = []
	}

	return true
}
