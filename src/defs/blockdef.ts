import Base from "./base.js"

export default class BlockDef extends Base {

	readonly maxItemStack: number

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		this.maxItemStack = data.maxItemStack as number || 128
	}

	get assetsPath() {
		return `${this.namespace}/textures/block/${this.idname}.png`
	}

}
