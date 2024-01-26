import { isInteger } from "../util/typecheck.js"
import Base from "./Base.js"

export default class BlockDef extends Base {

	readonly type: "block" | "fluid" | "container"
	readonly maxItemStack: number
	readonly inventorySlots: number | null

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		if (!validate(data)) throw new Error(`Invalid blockdef for ${namespace}:${idname}: ${JSON.stringify(data)}`)

		this.type = data.type
		this.maxItemStack = data.maxItemStack

		if (data.type == "container") this.inventorySlots = data.inventorySlots
		else this.inventorySlots = null
	}

	get assetsPath() {
		return `${this.namespace}/textures/block/${this.idname}.png`
	}

	hasInventory() {
		return this.type == "container"
	}

	isSolid() {
		return (this.type == "block" || this.type == "container") && this.id != "tiny:air"
	}

	mainLayerOnly() {
		return this.type == "container"
	}

}

type BlockDefData = {
	maxItemStack: number
} & ({
	type: "block" | "fluid"
} | {
	type: "container",
	inventorySlots: number
})

function validate(data: any): data is BlockDefData {
	if (typeof data != "object") return false

	if ("type" in data) {
		if (!["block", "fluid", "container"].includes(data.type)) return false
	} else {
		data.type = "block" // default
	}

	if ("maxItemStack" in data) {
		if (!isInteger(data.maxItemStack) || data.maxItemStack <= 0) return false
	} else {
		data.maxItemStack = 128 // default
	}

	if (data.type == "container") {
		if ("inventorySlots" in data) {
			if (!isInteger(data.inventorySlots) || data.inventorySlots <= 0) return false
		} else {
			data.inventorySlots = 27 // default
		}
	}

	return true
}
