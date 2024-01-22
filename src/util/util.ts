export function $<T extends Element>(q: string): T {
	const elem = document.querySelector<T>(q)
	if (!elem) {
		throw new Error(`Element not found: ${q}`)
	}
	return elem
}
