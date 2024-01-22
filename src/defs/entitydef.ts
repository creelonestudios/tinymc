import Base from "./base.js"

export default class EntityDef extends Base {

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}.png`
	}

}
