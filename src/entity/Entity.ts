import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import EntityDef from "../defs/EntityDef.js"
import { entitydefs } from "../main.js"
import World from "../world/World.js"
import Graphics from "../Graphics.js"

export default class Entity {

	static readonly TERMINAL_VELOCITY = 4
	static readonly GRAVITY = 0.15

	static applyGravity(motion: Dim3) {
		motion.y -= Entity.GRAVITY
		if (motion.y < -Entity.TERMINAL_VELOCITY) motion.y = -Entity.TERMINAL_VELOCITY
	}

	readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3
	protected readonly size: Dim2
	readonly spawnTime: number

	noGravity: boolean
	onGround: boolean

	constructor(def: EntityDef | string, data: Partial<EntityData> = {}) {
		if (def instanceof EntityDef) this.def = def
		else {
			let entitydef = entitydefs.get(def)
			if (entitydef) this.def = entitydef
			else {
				console.trace()
				throw "Entity definition not found: " + def
			}
		}
		this.position = new Dim3(...(data.position || [0, 0, 0]))
		this.rotation = new Dim3(...(data.rotation || [0, 0, 0]))
		this.motion   = new Dim3(...(data.motion   || [0, 0, 0]))
		this.size     = new Dim2()
		this.spawnTime = data.spawnTime || Date.now() // TODO: ticks since world creation
		this.noGravity = typeof data.noGravity == "undefined" ? false : data.noGravity
		this.onGround  = typeof data.onGround == "undefined" ? false : data.onGround
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
		const {x: pX, y: pY, z: pZ} = this.position // p -> present
		const box = this.getBoundingBox()
		let motion = this.motion.copy()
		Entity.applyGravity(motion)
		const fY = pY + motion.y // f -> future
		let onGround = false

		// check ground collision (but not walls or ceiling)
		loop: for (let y = Math.floor(pY) -1; y >= Math.floor(fY); y--) {
			for (let x = Math.floor(box.pos.x); x <= Math.ceil(box.corner.x); x++) {
				box.pos.y = y
				const blockBelow = world.getBlock(x, y, pZ)
				if (blockBelow && blockBelow.isSolid()) {
					if (box.intersect(blockBelow?.getBoundingBox(x, y))) {
						onGround = true
						this.motion.y = 0
						this.position.y = y + 1
						break loop
					}
				}
			}
		}
		this.onGround = onGround

		if (onGround && this.motion.y < 0) this.motion.y = 0

		// apply gravity
		if (!onGround && !this.noGravity) {
			Entity.applyGravity(this.motion)
		}

		// ground friction
		if (onGround && this.def.hasFriction) {
			this.motion.x *= 0.5
			if (Math.abs(this.motion.x) <= 0.5 ** 5) this.motion.x = 0
		}

		this.position.add(this.motion)

		if (this.position.y < world.minY - 50) this.die(world)
	}

	draw(g: Graphics) {
		g.save()
		g.translate(this.x, this.y)
		g.translate(-this.size.x/2, 0) // to center (x)

		this.texture?.draw(g, this.size.x, this.size.y)

		g.restore()
	}

	die(world: World) {
		world.removeEntity(this)
	}

	getData(): EntityData {
		return {
			id: this.id,
			motion: this.motion.asArray(),
			position: this.position.asArray(), // TODO: "pos" alias for compatibility
			rotation: this.rotation.asArray(),
			noGravity: this.noGravity,
			onGround: this.onGround,
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
