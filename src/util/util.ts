export function $<T extends Element>(q: string): T {
	const elem = document.querySelector<T>(q)

	if (!elem) throw new Error(`Element not found: ${q}`)

	return elem
}

export function recordToMap<K extends string | number | symbol, V>(record: Record<K, V>): Map<K, V> {
	const arr = Object.entries(record) as [K, V][]

	return new Map<K, V>(arr)
}
