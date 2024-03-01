import EntityDef, { EntityDefData } from "./EntityDef.js"

export default class PlayerDef extends EntityDef {

	constructor() {
		super("tiny", "player", {
			attributes: [{
				name: "generic.movement_speed",
				base: 1
			}, {
				name: "player.block_interaction_range",
				base: 4.5
			}, {
				name: "player.entity_interaction_range",
				base: 5
			}]
		} satisfies Partial<EntityDefData>)
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}/${this.idname}.png`
	}

	skinAssetsPath(skin: string, pose: string = skin) {
		return `${this.namespace}/textures/skin/${skin}/${pose}.png`
	}

}
