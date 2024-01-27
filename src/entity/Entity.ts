import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import EntityDef from "../defs/EntityDef.js"
import { entitydefs } from "../main.js"
import World from "../world/World.js"
import Graphics from "../Graphics.js"

export default class Entity {

	readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3
	protected readonly size: Dim2
	readonly spawnTime: number

	noGravity: boolean

	constructor(def: EntityDef | string, data: Partial<EntityData> = {}) {
		if (def instanceof EntityDef) this.def = def
		else {
			let entitydef = entitydefs.get(def)
			if (entitydef) this.def = entitydef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
		this.position = new Dim3(...(data.position || [0, 0, 0]))
		this.rotation = new Dim3(...(data.rotation || [0, 0, 0]))
		this.motion   = new Dim3(...(data.motion   || [0, 0, 0]))
		this.size     = new Dim2()
		this.spawnTime = data.spawnTime || Date.now() // TODO: ticks since world creation
		this.noGravity = typeof data.noGravity == "undefined" ? false : data.noGravity
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	get x() {
		return this.position.x
	}

	get y() {
		return this.position.y
	}

	getBoundingBox() {
		let pos = this.position.copy()
		pos.x -= this.size.x/2
		return new BoundingBox(pos, this.size)
	}

	tick(world: World) {
		this.position.add(this.motion)
	}

	draw(g: Graphics) {
		g.save()
		g.translate(this.x, this.y)
		g.translate(-this.size.x/2, 0) // to center (x)

		this.texture?.draw(g, this.size.x, this.size.y)

		g.restore()
	}

	getData(): EntityData {
		return {
			id: this.id,
			motion: this.motion.asArray(),
			position: this.position.asArray(), // TODO: "pos" alias for compatibility
			rotation: this.rotation.asArray(),
			noGravity: this.noGravity,
			onGround: false,
			spawnTime: this.spawnTime
		}
	}

}

export type EntityData = {
	id: string,
	motion: number[],
	position: number[],
	rotation: number[],
	noGravity: boolean,
	onGround: boolean,
	spawnTime: number
}
