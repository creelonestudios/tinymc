import { type NamespacedId, RawNamespacedId } from "./interfaces"

const namespaceRegex = /^[0-9a-z_.-]+$/
const pathRegex = /^(?:[0-9a-z_.-]+\/)*[0-9a-z_.-]+$/

export default class ResourceLocation {

	readonly namespace: string
	readonly path: string

	constructor(raw: NamespacedId) {
		if (raw instanceof ResourceLocation) { // copy
			this.namespace = raw.namespace
			this.path = raw.path

			return
		}

		if (!raw.includes(":")) throw new Error(`Invalid ResourceLocation [${raw}]`)

		const colonIndex = raw.indexOf(":")
		const namespace = raw.substring(0, colonIndex)
		const path = raw.substring(colonIndex + 1)

		if (!namespaceRegex.test(namespace)) throw new Error(`Invalid namespace [${namespace}] in [${raw}]`)
		if (!pathRegex.test(path)) throw new Error(`Invalid path [${path}] in [${raw}]`)

		this.namespace = namespace
		this.path = path
	}

	getPathEntries(): string[] {
		return this.path.split("/")
	}

	matches(...ids: NamespacedId[] | string[]): boolean {
		for (const id of ids) {
			if (this.toString() == id) return true
		}

		return false
	}

	toString(): RawNamespacedId {
		return `${this.namespace}:${this.path}`
	}

	toYSON() {
		return this.toString()
	}

}
