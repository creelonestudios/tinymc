import { isInRangeIncl, isObject, validateProperty } from "../util/typecheck.js"
import { type NamespacedId, type RawNamespacedId } from "../util/interfaces.js"
import Attribute from "./Attribute.js"
import { recordToMap } from "../util/util.js"
import { Registry } from "../Registry.js"
import TexturedResource from "./TexturedResource.js"
import TinyError from "../TinyError.js"
import YSON from "https://j0code.github.io/yson/YSON.js"

export default class EntityDef extends TexturedResource {

	readonly hasFriction: boolean
	readonly attributes: Map<NamespacedId, number>
	readonly eyeHeight: number

	constructor(id: NamespacedId, data: unknown, attributes: Registry<Attribute>) {
		super(id)
		try {
			if (!validate(data, attributes)) throw new Error(`Invalid entitydef for ${id}: ${YSON.stringify(data)}`)
		} catch (e) {
			// @ts-expect-error e should be an Error
			throw new TinyError(`Invalid entitydef for ${id}`, e)
		}

		this.hasFriction = data.hasFriction
		this.attributes = recordToMap(data.attributes)
		this.eyeHeight = data.eyeHeight
	}

	get assetsPath() {
		return `${this.id.namespace}/textures/entity/${this.id.path}.png`
	}

}

export type EntityDefData = {
	hasFriction: boolean,
	attributes: Record<RawNamespacedId, number>,
	eyeHeight: number
}

function validate(data: unknown, attributes: Registry<Attribute>): data is EntityDefData {
	if (!isObject(data)) throw new Error(`expected an object but got ${data}`)

	validateProperty(data, "hasFriction", "boolean", false)
	validateProperty(data, "attributes", (rec, path) => {
		if (!isObject(rec)) throw new Error(`Expected a Record at ${path} but got ${YSON.stringify(rec)}`)

		for (const attr of attributes.values()) {
			validateProperty(rec, attr.id.toString(), isInRangeIncl(attr.min, attr.max), attr.base, `${path}.${attr.id}`)
		}

		return true
	}, [])
	validateProperty(data, "eyeHeight", isInRangeIncl(0, 1), 0.5)

	return true
}
