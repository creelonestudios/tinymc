import Base from "./Base.js"

export default class ItemDef extends Base {

	readonly maxItemStack: number

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.namespace}/textures/item/${this.idname}.png`
	}

}
