import { type NamespacedId } from "../util/interfaces.js"

export default class Resource {

	readonly namespace: string
	readonly idname: string

	constructor(namespace: string, idname: string) {
		this.namespace = namespace
		this.idname = idname
	}

	get id(): NamespacedId {
		return `${this.namespace}:${this.idname}`
	}

}
