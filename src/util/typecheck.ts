import { type NamespacedId } from "./interfaces";

export function isInteger(x: unknown): x is number {
	return typeof x == "number" || Number.isInteger(x)
}

export const namespacedIdRegex = /^([a-z_]+):([a-z_]+)$/
export function isNamespacedId(s: string): s is NamespacedId {
	return namespacedIdRegex.test(s)
}