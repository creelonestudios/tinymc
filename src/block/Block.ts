import BlockDef from "../defs/BlockDef.js"
import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import { blockdefs, debug } from "../main.js"
import Graphics from "../Graphics.js"
import { type HasData, type BaseData, type Flatten, type NamespacedId } from "../util/interfaces.js"
import World from "../world/World.js"

export default class Block implements HasData {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)
		return new Block(data.id)
	}

	protected readonly def: BlockDef

	private readonly light: { sky: number, block: number }

	constructor(def: BlockDef | NamespacedId) {
		if (def instanceof BlockDef) this.def = def
		else {
			let blockdef = blockdefs.get(def)
			if (blockdef) this.def = blockdef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}

		this.light = { sky: 0, block: 0 }
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	get type() {
		return this.def.type
	}

	get maxItemStack() {
		return this.def.maxItemStack
	}

	get full() {
		return this.def.full
	}

	get skyLight() {
		return this.light.sky
	}

	get blockLight() {
		return Math.max(this.light.block, this.def.lightLevel)
	}

	get lightLevel() {
		return Math.max(this.skyLight, this.blockLight)
	}

	hasInventory() {
		return this.def.hasInventory()
	}

	isSolid() {
		return this.def.isSolid()
	}

	mainLayerOnly() {
		return this.def.mainLayerOnly()
	}

	getBoundingBox(x: number, y: number) {
		x = Math.floor(x)
		y = Math.floor(y)
		return new BoundingBox(new Dim3(x, y), new Dim2(1, 1))
	}

	update(world: World, x: number, y: number, z: number) {
		this.light.sky = updateSkyLight(world, x, y, z, this.light.sky)
		this.light.block = updateBlockLight(world, x, y, z, this.light.block)
	}

	draw(g: Graphics, x: number, y: number, z: number) {
		if (this.def.id == "tiny:air") {
			if (debug.showAirLightLevel) {
				overlayLightLevel(g, x, y, this.lightLevel)
			}
			return
		}

		g.save()
		g.translate(x, y)

		let light = this.lightLevel / 15

		const FLUID_TRANSLUCENCY = 0.35
		if (this.type == "fluid") g.globalAlpha = 1 - (1 - FLUID_TRANSLUCENCY) * light
		if (z < 0) light *= 0.75
		//console.log(light)
		g.brightness(light)
		this.texture?.draw(g)

		g.restore()
	}

	getData(x: number, y: number, z: number): BlockData {
		return {
			id: this.id,
			x, y, z
		}
	}

}

export type BlockData = Flatten<BaseData & {
	x: number,
	y: number,
	z: number
}>

function updateSkyLight(world: World, x: number, y: number, z: number, skyLightBefore: number) {
	const derivLight = []
	let skyLight: number = skyLightBefore

	// from above
	const leftBlock = world.getBlock(x-1, y, z)
	const rightBlock = world.getBlock(x+1, y, z)
	if (!leftBlock?.isSolid() || !leftBlock.full) derivLight.push(deriveSkyLight(world, x-1, y+1, z))
	derivLight.push(deriveSkyLight(world, x, y+1, z))
	if (!rightBlock?.isSolid() || !rightBlock.full) derivLight.push(deriveSkyLight(world, x+1, y+1, z))
	// from right/left
	derivLight.push(deriveSkyLight(world, x-1, y, z)/2)
	derivLight.push(deriveSkyLight(world, x+1, y, z)/2)
	
	skyLight = Math.floor(Math.max(...derivLight, 0))
	if (skyLight != skyLightBefore) {
		// right/left
		world.scheduleBlockUpdate(x-1, y,   z)
		world.scheduleBlockUpdate(x+1, y,   z)
		// below
		world.scheduleBlockUpdate(x-1, y-1, z)
		world.scheduleBlockUpdate(x,   y-1, z)
		world.scheduleBlockUpdate(x+1, y-1, z)
	}

	return skyLight
}

function updateBlockLight(world: World, x: number, y: number, z: number, blockLightBefore: number) {
	const derivLight = []
	let blockLight: number = blockLightBefore

	if (z == 0) {
		derivLight.push(deriveBlockLight(world, x-1, y, z))
		derivLight.push(deriveBlockLight(world, x+1, y, z))
		derivLight.push(deriveBlockLight(world, x, y-1, z))
		derivLight.push(deriveBlockLight(world, x, y+1, z))
	}
	derivLight.push(deriveBlockLight(world, x, y, z-1))
	derivLight.push(deriveBlockLight(world, x, y, z+1))

	blockLight = Math.floor(Math.max(...derivLight, 0))
	if (blockLight != blockLightBefore) {
		if (z == 0) {
			world.scheduleBlockUpdate(x-1, y, z)
			world.scheduleBlockUpdate(x+1, y, z)
			world.scheduleBlockUpdate(x, y-1, z)
			world.scheduleBlockUpdate(x, y+1, z)
		}
		world.scheduleBlockUpdate(x, y, z-1)
		world.scheduleBlockUpdate(x, y, z+1)
	}

	return blockLight
}

function deriveSkyLight(world: World, x: number, y: number, z: number) {
	const other = world.getBlock(x, y, z)
	if (!other) {
		return 15
	} else if (other.id == "tiny:air" || !other.full) {
		return other.skyLight
	} else if (other.isSolid()) {
		return 0 // Math.floor(other.skyLight * 0.5)
	} else {
		return other.skyLight - 1
	}
}

function deriveBlockLight(world: World, x: number, y: number, z: number) {
	const other = world.getBlock(x, y, z)
	if (!other || (other.isSolid() && other.full)) {
		return 0
	} else {
		return other.blockLight - 1
	}
}

function overlayLightLevel(g: Graphics, x: number, y: number, level: number) {
	g.save()
	g.translate(x, y)
	g.ctx.fillStyle = "black"
	g.ctx.globalAlpha = 1 - level / 15
	g.ctx.fillRect(0, 0, 80, -80)
	g.restore()
}
