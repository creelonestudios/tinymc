import EntityDef, { EntityDefData } from "./EntityDef.js"
import Attribute from "./Attribute.js"
import { Registry } from "../Registry.js"

export default class PlayerDef extends EntityDef {

	constructor(attributes: Registry<Attribute>) {
		super("tiny", "player", {
			attributes: {
				"tiny:movement_speed":           1,
				"tiny:jump_strength":            0.35,
				"tiny:scale":                    1,
				"tiny:block_interaction_range":  4.5,
				"tiny:entity_interaction_range": 5
			},
			eyeHeight: 0.6
		} satisfies Partial<EntityDefData>, attributes)
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}/${this.idname}.png`
	}

	skinAssetsPath(skin: string, pose: string = skin) {
		return `${this.namespace}/textures/skin/${skin}/${pose}.png`
	}

}
