import { type ArrayElement, type HasData } from "./util/interfaces"
import EntityDef from "./defs/EntityDef"

const AttributeNames = [
	"generic.movement_speed",
	"generic.jump_strength",
	"generic.scale",
	"player.block_interaction_range",
	"player.entity_interaction_range"
] as const satisfies `${string}.${string}`[]

export type AttributeName = ArrayElement<typeof AttributeNames>

export type Attribute = {
	name: AttributeName,
	base: number
}

export function isAttribute(data: unknown): data is Attribute {
	if (typeof data != "object" || data == null) return false

	// @ts-expect-error ts is being stupid here (AttributeNames.includes() should accept any string)
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

	get(name: AttributeName, defaultValue?: number) {
		return this.list.get(name) || defaultValue
	}

	set(name: AttributeName, base: number) {
		let allowed = false
		for (const attr of this.def.attributes) {
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
