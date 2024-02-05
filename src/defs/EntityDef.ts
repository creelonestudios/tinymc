import Base from "./Base.js"

export default class EntityDef extends Base {

	readonly hasFriction: boolean

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		if (!validate(data)) throw new Error(`Invalid entitydef for ${namespace}:${idname}: ${JSON.stringify(data)}`)

		this.hasFriction = data.hasFriction
	}

	get assetsPath() {
		return `${this.namespace}/textures/entity/${this.idname}.png`
	}

}

type EntityDefData = {
	hasFriction: boolean
}

function validate(data: any): data is EntityDefData {
	if ("hasFriction" in data) {
		if (typeof data.hasFriction != "boolean") return false
	} else {
		data.hasFriction = false
	}

	return true
}
