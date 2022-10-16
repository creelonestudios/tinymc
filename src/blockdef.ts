import Base from "./base.js"

export default class BlockDef extends Base {

	constructor(namespace: string, idname: string, data: object) {
		super(namespace, idname)
	}

	get assetsPath() {
		return `${this.namespace}/textures/block/${this.idname}.png`
	}

}