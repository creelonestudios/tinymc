type Listener<T> = (...args: T[]) => void

export default class EventEmitter {

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private listeners: Map<string, Listener<any>[]>

	constructor() {
		this.listeners = new Map()
	}

	on<T>(event: string, listener: Listener<T>) {
		const arr = this.listeners.get(event) || []

		arr.push(listener)
		this.listeners.set(event, arr)
	}

	emit<T>(event: string, ...args: T[]) {
		const arr = this.listeners.get(event) || []

		for (const listener of arr) listener(...args)
	}

}
