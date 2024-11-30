import { isInRangeIncl, isObject, validateProperty } from "../util/typecheck.js"
import { NamespacedId } from "../util/interfaces.js"
import Resource from "./Resource.js"
import TinyError from "../TinyError.js"
import YSON from "https://j0code.github.io/yson/YSON.js"

export default class Attribute extends Resource {

	readonly base: number
	readonly min: number
	readonly max: number

	constructor(id: NamespacedId, data: unknown) {
		super(id)
		try {
			if (!isAttributeDef(data)) throw new Error(`Invalid attribute ${id}: ${YSON.stringify(data)}`)
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

export function isAttribute(data: unknown): data is AttributeData {
	if (!isObject(data)) throw new Error(`expected an object but got ${data}`)

	validateProperty(data, "base", "number")

	return true
}

export function isAttributeDef(data: unknown): data is AttributeDefData {
	if (!isAttribute(data)) return false

	if (!validateProperty(data, "min",  "number", 0)) return false
	if (!validateProperty(data, "max",  "number", 1)) return false

	validateProperty(data, "base", isInRangeIncl(Number(data.min), Number(data.max)), Number(data.min))

	return true
}
