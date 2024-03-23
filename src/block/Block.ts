import { type BaseData, type Flatten, type HasData, type NamespacedId } from "../util/interfaces.js"
import { blockdefs, debug } from "../main.js"
import BlockDef from "../defs/BlockDef.js"
import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import Graphics from "../Graphics.js"
import LightColor from "../util/LightColor.js"
import World from "../world/World.js"

export default class Block implements HasData {

	// eslint-disable-next-line
	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)

		return new Block(data.id)
	}

	protected readonly def: BlockDef

	private readonly light: { sky: number, block: LightColor }

	constructor(def: BlockDef | NamespacedId) {
		if (def instanceof BlockDef) this.def = def
		else {
			const blockdef = blockdefs.get(def)

			if (blockdef) this.def = blockdef
			else {
				throw new Error(`Block definition not found: ${def}`)
			}
		}

		this.light = { sky: 0, block: new LightColor(0, 0, 0) }
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
		if (this.def.light) return this.light.block.max(this.def.light)

		return this.light.block
	}

	get lightLevel() {
		return Math.max(this.skyLight, this.blockLight.level)
	}

	lightColor(world: World) {
		return this.light.block.max(world.skyLight.scale(this.light.sky))
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

	playSound(sound: keyof BlockDef["sounds"]) {
		// console.log("playSound", sound, this.def.sounds[sound])
		this.def.sounds[sound]?.play()
	}

	getBoundingBox(x: number, y: number) {
		x = Math.floor(x)
		y = Math.floor(y)

		return new BoundingBox(new Dim3(x, y), new Dim2(1, 1))
	}

	update(world: World, x: number, y: number, z: number) {
		this.light.sky = updateSkyLight(world, this, x, y, z, this.light.sky)
		this.light.block = updateBlockLight(world, this, x, y, z, this.light.block)
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	draw(g: Graphics, world: World, x: number, y: number, z: number) {
		let light = this.lightColor(world)
		if (z < 0) light = light.scale(12)

		if (this.def.id == "tiny:air" && z <= 0) {
			if (debug.showDebugScreen && debug.showAirLightLevel) overlayLight(g, x, y, light)

			return
		}

		g.save()
		g.translate(x, y)

		/* let light = this.lightLevel / 15

		const FLUID_TRANSLUCENCY = 0.35

		if (this.type == "fluid") g.globalAlpha = 1 - (1 - FLUID_TRANSLUCENCY) * light
		if (z < 0) light *= 0.75

		*/

		if (light.level == 0) {
			g.fillStyle = "black"
			g.fillRect()
		} else {
			this.texture?.draw(g, 1, 1, false, light)
		}

		// console.log(light)
		// g.brightness(light)


		g.restore()
	}

	getData(x: number, y: number, z: number): BlockData {
		return {
			id: this.id,
			x,
			y,
			z
		}
	}

}

export type BlockData = Flatten<BaseData & {
	x: number,
	y: number,
	z: number
}>

function updateSkyLight(world: World, block: Block, x: number, y: number, z: number, skyLightBefore: number) {
	const derivLight = []
	let skyLight: number = skyLightBefore

	// from above
	const leftBlock = world.getBlock(x-1, y, z)
	const rightBlock = world.getBlock(x+1, y, z)

	derivLight.push(deriveSkyLight(world, x, y+1, z))

	// diagonal
	if (!leftBlock?.isSolid()  || !leftBlock.full)  derivLight.push(deriveSkyLight(world, x-1, y+1, z))
	if (!rightBlock?.isSolid() || !rightBlock.full) derivLight.push(deriveSkyLight(world, x+1, y+1, z))

	// from right/left
	derivLight.push(deriveSkyLight(world, x-1, y, z)/2)
	derivLight.push(deriveSkyLight(world, x+1, y, z)/2)

	// from front / back
	if (z < 0) derivLight.push(deriveSkyLight(world, x, y, z+1))
	if (!block.isSolid() || !block.full) {
		derivLight.push(deriveSkyLight(world, x, y, z-1))
	}

	skyLight = Math.floor(Math.max(...derivLight, 0))
	if (skyLight != skyLightBefore) {
		// right/left
		world.scheduleBlockUpdate(x-1, y,   z)
		world.scheduleBlockUpdate(x+1, y,   z)

		// below
		world.scheduleBlockUpdate(x-1, y-1, z)
		world.scheduleBlockUpdate(x,   y-1, z)
		world.scheduleBlockUpdate(x+1, y-1, z)

		// front / back
		world.scheduleBlockUpdate(x, y, z-1)
		world.scheduleBlockUpdate(x, y, z+1)
	}

	return skyLight
}

function updateBlockLight(world: World, block: Block, x: number, y: number, z: number, blockLightBefore: LightColor) {
	const derivLight: LightColor[] = []

	derivLight.push(deriveBlockLight(world, x-1, y, z))
	derivLight.push(deriveBlockLight(world, x+1, y, z))
	derivLight.push(deriveBlockLight(world, x, y-1, z))
	derivLight.push(deriveBlockLight(world, x, y+1, z))

	if (z < 0) derivLight.push(deriveBlockLight(world, x, y, z+1))
	if (!block.isSolid() || !block.full) {
		derivLight.push(deriveBlockLight(world, x, y, z-1))
	}

	const blockLight = LightColor.max(derivLight)

	if (!blockLight.equals(blockLightBefore)) {
		world.scheduleBlockUpdate(x-1, y, z)
		world.scheduleBlockUpdate(x+1, y, z)
		world.scheduleBlockUpdate(x, y-1, z)
		world.scheduleBlockUpdate(x, y+1, z)
		world.scheduleBlockUpdate(x, y, z-1)
		world.scheduleBlockUpdate(x, y, z+1)
	}

	return blockLight
}

function deriveSkyLight(world: World, x: number, y: number, z: number) {
	const other = world.getBlock(x, y, z)

	if (!other) return 15
	else if (other.id == "tiny:air" || !other.full) return other.skyLight
	else if (other.isSolid()) return 0 // Math.floor(other.skyLight * 0.5)

	return other.skyLight - 1 // water
}

function deriveBlockLight(world: World, x: number, y: number, z: number): LightColor {
	const other = world.getBlock(x, y, z)

	if (!other || (other.isSolid() && other.full)) return new LightColor(0, 0, 0)

	return other.blockLight.decrement()
}

function overlayLight(g: Graphics, x: number, y: number, light: LightColor) {
	g.save()
	g.translate(x, y)
	g.fillStyle = light.toString()
	g.globalAlpha = 0.4
	g.fillRect()
	g.restore()
}
