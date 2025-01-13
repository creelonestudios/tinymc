import { assertObject, isInRangeIncl, validateProperty } from "../util/typecheck.js"
import { NamespacedId } from "../util/interfaces.js"
import Resource from "./Resource.js"
import TinyError from "../TinyError.js"

export default class Attribute extends Resource {

	readonly base: number
	readonly min: number
	readonly max: number

	constructor(id: NamespacedId, data: unknown) {
		super(id)
		try {
			isAttributeDef(data)
		} catch (e) {
			// @ts-expect-error e should be an Error
			throw new TinyError(`Invalid attribute ${id}`, e)
		}

		this.base = data.base
		this.min = data.min
		this.max = data.max
	}

}

export type AttributeData = {
	base: number
}

export type AttributeDefData = AttributeData & {
	min: number,
	max: number
}

export function isAttribute(data: unknown): asserts data is AttributeData {
	assertObject(data)

	validateProperty(data, "base", "number")
}

export function isAttributeDef(data: unknown): asserts data is AttributeDefData {
	isAttribute(data)

	validateProperty(data, "min",  "number", 0)
	validateProperty(data, "max",  "number", 1)
	validateProperty(data, "base", isInRangeIncl(Number(data.min), Number(data.max)), Number(data.min))
}
