import EntityDef from "./entitydef.js"

export default class PlayerDef extends EntityDef {

	constructor() {
		super("tiny", "player", {})
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}/${this.idname}.png`
	}

	skinAssetsPath(skin: string, pose: string = skin) {
		return `${this.namespace}/textures/skin/${skin}/${pose}.png`
	}

}