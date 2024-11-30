import { equalsAny, isIntInRange, isObject, isPosInt, validateArray, validateProperty } from "../util/typecheck.js"
import { type Flatten } from "../util/interfaces.js"
import { getSound } from "../main.js"
import LightColor from "../util/LightColor.js"
import Sound from "../sound/Sound.js"
import TexturedResource from "./TexturedResource.js"
import TinyError from "../TinyError.js"

export default class BlockDef extends TexturedResource {

	readonly type: "block" | "fluid" | "container"
	readonly maxItemStack: number
	readonly full: boolean
	readonly soundMaterial: string
	readonly light: LightColor | null
	readonly inventorySlots: number | null
	readonly inventoryColumns: number | null

	readonly sounds: {
		break: Sound,
		place: Sound
	}

	constructor(namespace: string, idname: string, data: unknown) {
		super(namespace, idname)
		try {
			if (!validate(data)) throw new Error(`Invalid blockdef for ${namespace}:${idname}: ${JSON.stringify(data)}`)
		} catch (e) {
			// @ts-expect-error e should be an Error
			throw new TinyError(`Invalid blockdef for ${namespace}:${idname}`, e)
		}

		this.type = data.type
		this.maxItemStack = data.maxItemStack
		this.soundMaterial = data.soundMaterial
		this.sounds = {
			break: getSound(`block.${this.soundMaterial}.break`),
			place: getSound(`block.${this.soundMaterial}.place`)
		} as const

		if (data.type == "container" || data.type == "block") this.full = data.full
		 else this.full = true


		if (data.type == "container") {
			this.inventorySlots = data.inventorySlots
			this.inventoryColumns = data.inventoryColumns
		} else this.inventorySlots = this.inventoryColumns = null

		if (data.type == "block") this.light = new LightColor(...data.light)
		else this.light = null
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
	soundMaterial: string
} & ({
	type: "fluid"
} | {
	full: boolean
} & ({
	type: "block",
	light: [number, number, number]
} | {
	type: "container",
	inventorySlots: number
	inventoryColumns: number
}))>

function validate(data: unknown): data is BlockDefData {
	if (!isObject(data)) throw new Error(`expected an object but got ${data}`)

	const allowedTypes = ["block", "fluid", "container"]

	if (!validateProperty<BlockDefData["type"], "type">(data, "type", x => equalsAny(allowedTypes, x), "block")) {
		return false
	}

	validateProperty(data, "maxItemStack", isPosInt, 128)
	validateProperty(data, "soundMaterial", "string", "grass")

	if (data.type == "container" || data.type == "block") {
		validateProperty(data, "full", "boolean", true)
	}

	if (data.type == "block") {
		validateProperty(data, "light", validateArray(isIntInRange(0, 16)), [0, 0, 0])
	}

	if (data.type == "container") {
		validateProperty(data, "inventorySlots", isPosInt, 27)
		validateProperty(data, "inventoryColumns", isPosInt, 9)
	}

	return true
}
