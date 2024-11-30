import { type HasData, NamespacedId } from "./util/interfaces.js"
import { AttributeData } from "./defs/Attribute.js"
import { attributes } from "./main.js"
import Entity from "./entity/Entity.js"
import { isInRangeIncl } from "./util/typecheck.js"

export default class AttributeList implements HasData {

	private list: Map<NamespacedId, number>
	private entity: Entity

	constructor(entity: Entity) {
		this.list = new Map()
		this.entity = entity

		// default
		for (const attr of attributes.values()) {
			this.list.set(attr.id, entity.def.attributes.get(attr.id) || attr.base)
		}
	}

	get(id: NamespacedId): number {
		if (!attributes.exists(id)) throw new Error(`Unknown attribute: ${id}`)

		return this.list.get(id) || this.entity.def.attributes.get(id) || attributes.get(id)!.base
	}

	set(id: NamespacedId, base: number) {
		if (!attributes.exists(id)) throw new Error(`Unknown attribute: ${id}`)

		const attr = attributes.get(id)!

		if (isInRangeIncl(attr.min, attr.max)(base)) {
			this.list.set(id, base)

			return
		}
	}

	getData(): AttributeData[] {
		return Array.from(this.list).map(e => ({ id: e[0], base: e[1] }))
	}

}
