import { getSound } from "../main.js"
import Sound from "../sound/Sound.js"
import { type Flatten } from "../util/interfaces.js"
import { isInteger } from "../util/typecheck.js"
import Base from "./Base.js"

export default class BlockDef extends Base {

	readonly type: "block" | "fluid" | "container"
	readonly maxItemStack: number
	readonly full: boolean
	readonly sound_material: string
	readonly lightLevel: number
	readonly inventorySlots: number | null
	readonly inventoryColumns: number | null

	readonly sounds: {
		break: Sound,
		place: Sound
	}

	constructor(namespace: string, idname: string, data: any) {
		super(namespace, idname)
		if (!validate(data)) throw new Error(`Invalid blockdef for ${namespace}:${idname}: ${JSON.stringify(data)}`)

		this.type = data.type
		this.maxItemStack = data.maxItemStack
		this.sound_material = data.sound_material
		this.sounds = {
			break: getSound(`block.${this.sound_material}.break`),
			place: getSound(`block.${this.sound_material}.place`)
		} as const

		if (data.type == "container" || data.type == "block") {
			this.full = data.full
		} else {
			this.full = true
		}

		if (data.type == "container") {
			this.inventorySlots = data.inventorySlots
			this.inventoryColumns = data.inventoryColumns
		} else this.inventorySlots = this.inventoryColumns = null

		if (data.type == "block") {
			this.lightLevel = data.lightLevel
		} else this.lightLevel = 0
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

type BlockDefData = Flatten<{
	maxItemStack: number,
	sound_material: string
} & ({
	type: "fluid"
} | {
	full: boolean
} & ({
	type: "block",
	lightLevel: number	
} | {
	type: "container",
	inventorySlots: number
	inventoryColumns: number
}))>

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

	if ("sound_material" in data) {
		if (typeof data.sound_material != "string") return false
	} else {
		data.sound_material = "grass" // default
	}

	if (data.type == "container" || data.type == "block") {
		if ("full" in data) {
			if (typeof data.full != "boolean") return false
		} else {
			data.full = true // default
		}
	}

	if (data.type == "block") {
		if ("lightLevel" in data) {
			if (!isInteger(data.lightLevel) || data.lightLevel < 0 || data.lightLevel > 15) return false
		} else {
			data.lightLevel = 0 // default
		}
	}

	if (data.type == "container") {
		if ("inventorySlots" in data) {
			if (!isInteger(data.inventorySlots) || data.inventorySlots <= 0) return false
		} else {
			data.inventorySlots = 27 // default
		}
		if ("inventoryColumns" in data) {
			if (!isInteger(data.inventoryColumns) || data.inventoryColumns <= 0) return false
		} else {
			data.inventoryColumns = 9 // default
		}
	}

	return true
}
