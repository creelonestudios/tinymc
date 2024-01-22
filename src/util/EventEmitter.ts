export default class EventEmitter {
	
	private listeners: Map<string, Function[]>

	constructor() {
		this.listeners = new Map()
	}

	on(event: string, listener: Function) {
		let arr = this.listeners.get(event) || []
		arr.push(listener)
		this.listeners.set(event, arr)
	}

	emit(event: string, ...args: any[]) {
		let arr = this.listeners.get(event) || []
		for (let listener of arr) {
			listener(...args)
		}
	}

}