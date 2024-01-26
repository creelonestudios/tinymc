export function isInteger(x: unknown): x is number {
	return typeof x == "number" || Number.isInteger(x)
}
