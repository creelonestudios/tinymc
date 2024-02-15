import EntityDef from "./defs/EntityDef";
import { type ArrayElement, type HasData } from "./util/interfaces";

const AttributeNames = [
	"generic.movement_speed",
	"player.block_interaction_range",
	"player.entity_interaction_range"
] as const

export type AttributeName = ArrayElement<typeof AttributeNames>

export type Attribute = {
	name: AttributeName,
	base: number
}

export function isAttribute(data: any): data is Attribute {
	if (typeof data != "object" || data == null) return false
	if (!("name" in data) || typeof data.name != "string" || !AttributeNames.includes(data.name)) return false
	if (!("base" in data) || typeof data.base != "number") return false
	return true
}

export default class AttributeList implements HasData {

	private def: EntityDef
	private list: Map<AttributeName, number>

	constructor(def: EntityDef) {
		this.def = def
		this.list = new Map()

		// default
		def.attributes.forEach(attr => {
			this.list.set(attr.name, attr.base)
		})
	}

	get(name: AttributeName) {
		return this.list.get(name)
	}

	set(name: AttributeName, base: number) {
		let allowed = false
		for (let attr of this.def.attributes) {
			if (attr.name == name) {
				allowed = true
				break
			}
		}
		if (!allowed) return // TODO: error

		this.list.set(name, base)
	}

	getData(): Attribute[] {
		return Array.from(this.list).map(e => ({ name: e[0], base: e[1] }))
	}

}