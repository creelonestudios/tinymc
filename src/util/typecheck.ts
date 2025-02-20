import { type RawNamespacedId } from "./interfaces"
import YSON from "https://j0code.github.io/yson/YSON.js"

export const namespacedIdRegex = /^([a-z_]+):([a-z_]+)$/
export function isNamespacedId(s: string): s is RawNamespacedId {
	return namespacedIdRegex.test(s)
}

export function equalsAny(a: unknown[], b: unknown) {
	return a.includes(b)
}

export function isInteger(x: unknown): x is number {
	return typeof x == "number" && Number.isInteger(x)
}

export function isPosInt(x: unknown): x is number {
	return typeof x == "number" && Number.isInteger(x) && x > 0
}

/** x in [min, max) */
export function isInRange(min: number, max: number): (x: unknown) => x is number {
	return (x: unknown): x is number => typeof x == "number" && x >= min && x < max
}

/** x in [min, max] */
export function isInRangeIncl(min: number, max: number): (x: unknown) => x is number {
	return (x: unknown): x is number => typeof x == "number" && x >= min && x <= max
}

/** x in [min, max) */
export function isIntInRange(min: number, max: number): (x: unknown) => x is number {
	return (x: unknown): x is number => isInteger(x) && x >= min && x < max
}

export function isObject(x: unknown): x is object {
	return typeof x == "object" && x != null
}

export function assertObject(x: unknown): asserts x is object {
	if (!isObject) throw new Error(`expected an object but got ${x}`)
}

type PropCheck = ((x: unknown, path: string) => boolean) | "string" | "number" | "boolean"
export function safeValidateProperty<T, P extends string>(obj: object, prop: P, check?: PropCheck, defaultValue?: T, path: string = "$"): obj is Record<P, T> {
	try {
		validateProperty(obj, prop, check, defaultValue, path)

		return true
	} catch {
		return false
	}
}

export function validateProperty<T, P extends string>(obj: object, prop: P, check?: PropCheck, defaultValue?: T, path: string = "$"): asserts obj is Record<P, T> {
	const rec = obj as Record<string, unknown>

	if (prop in rec) {
		if (check) {
			if (typeof check == "function") {
				if (!check(rec[prop], `${path}.${prop}`)) throw new Error(`${path}.${prop} is invalid: ${YSON.stringify(rec[prop])}`)
			} else if (typeof rec[prop] != check) {
				throw new Error(`Expected a ${check} at ${path}.${prop} but got ${YSON.stringify(rec[prop])}`)
			}
		}
	} else rec[prop] = defaultValue
}

type TypeCheck<T> = ((x: unknown, path: string) => x is T) | "string" | "number" | "boolean"
export function validateArray<T>(check?: TypeCheck<T>): (arr: unknown, path?: string) => asserts arr is Array<T> {
	return (arr, path = "$"): asserts arr is Array<T> => {
		if (!(arr instanceof Array)) throw new Error(`Expected an array at ${path} but got ${YSON.stringify(arr)}`)
		if (!check) return

		for (let i = 0; i < arr.length; i++) {
			if (typeof check == "function") {
				if (!check(arr[i], `${path}[${i}]`)) throw new Error(`${path}[${i}] is invalid ${YSON.stringify(arr[i])}`)
			} else if (typeof arr[i] != check) {
				throw new Error(`Expected a ${check} at ${path}[${i}] but got ${YSON.stringify(arr[i])}`)
			}
		}
	}
}

export function safeValidateArray<T>(check?: TypeCheck<T>): (arr: unknown, path?: string) => arr is Array<T> {
	const arrayCheck: (arr: unknown, path?: string) => asserts arr is Array<T> = validateArray<T>(check)

	return (arr, path = "$"): arr is Array<T> => {
		try {
			arrayCheck(arr, path)

			return true
		} catch {
			return false
		}
	}
}

type KeyCheck<T> = ((x: unknown, path: string) => x is T) | "string" | "number" | "symbol"
export function validateRecord<K extends string | number | symbol, V>(
	keyCheck: KeyCheck<K>,
	valueCheck: TypeCheck<V>
): (rec: unknown, path?: string) => asserts rec is Record<K, V> {
	return (rec, path = "$"): asserts rec is Record<K, V> => {
		if (!isObject(rec)) throw new Error(`Expected a Record at ${path} but got ${YSON.stringify(rec)}`)
		if (!keyCheck && !valueCheck) return

		for (const k in Object.values(rec)) {
			// @ts-expect-error k can be used to index rec (see for loop)
			const v = rec[k]

			if (keyCheck) {
				if (typeof keyCheck == "function") {
					if (!keyCheck(k, `${path}`)) throw new Error(`key ${k} in ${path} is invalid`)
				} else if (typeof k != keyCheck) {
					throw new Error(`Expected a ${keyCheck} key at ${path} but got ${YSON.stringify(k)}`)
				}
			}

			if (valueCheck) {
				if (typeof valueCheck == "function") {
					if (!valueCheck(v, `${path}.${k}`)) throw new Error(`${path}.${k} is invalid ${YSON.stringify(v)}`)
				} else if (typeof v != valueCheck) {
					throw new Error(`Expected a ${valueCheck} at ${path}.${k} but got ${YSON.stringify(v)}`)
				}
			}
		}

		return
	}
}

export function safeValidateRecord<K extends string | number | symbol, V>(
	keyCheck: KeyCheck<K>,
	valueCheck: TypeCheck<V>
): (rec: unknown, path?: string) => rec is Record<K, V> {
	const recordCheck: (rec: unknown, path?: string) => asserts rec is Record<K, V> = validateRecord<K, V>(keyCheck, valueCheck)

	return (rec, path = "$"): rec is Record<K, V> => {
		try {
			recordCheck(rec, path)

			return true
		} catch {
			return false
		}
	}
}
