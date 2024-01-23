import Base from "./Base.js"

export default class BlockDef extends Base {

	readonly maxItemStack: number
	readonly inventorySlots: number | null

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		this.maxItemStack   = data.maxItemStack   as number || 128
		this.inventorySlots = data.inventorySlots as number || null
	}

	get assetsPath() {
		return `${this.namespace}/textures/block/${this.idname}.png`
	}

	hasInventory() {
		return this.inventorySlots != null
	}

}
