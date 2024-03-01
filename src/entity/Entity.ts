import BoundingBox from "../util/BoundingBox.js"
import Dim2 from "../dim/Dim2.js"
import Dim3 from "../dim/Dim3.js"
import EntityDef from "../defs/EntityDef.js"
import { entitydefs } from "../main.js"
import World from "../world/World.js"
import Graphics from "../Graphics.js"
import { type Flatten, type BaseData, type HasData, type NamespacedId } from "../util/interfaces.js"
import AttributeList from "../AttributeList.js"

export default class Entity implements HasData {

	static readonly TERMINAL_VELOCITY = 3
	static readonly TERMINAL_FLUID_VELOCITY = 0.15
	static readonly GRAVITY = 0.045

	static applyGravity(motion: Dim3, inFluid: boolean) {
		if (inFluid) {
			motion.y -= Entity.GRAVITY * 0.5
			if (motion.y < -Entity.TERMINAL_FLUID_VELOCITY) motion.y = -Entity.TERMINAL_FLUID_VELOCITY
		} else {
			motion.y -= Entity.GRAVITY
			if (motion.y < -Entity.TERMINAL_VELOCITY) motion.y = -Entity.TERMINAL_VELOCITY
		}
	}

	readonly def: EntityDef
	readonly position: Dim3
	protected rotation: number
	readonly motion: Dim3
	protected readonly size: Dim2
	readonly spawnTime: number
	readonly attributes: AttributeList

	noGravity: boolean
	onGround: boolean
	inFluid: boolean

	constructor(def: EntityDef | NamespacedId, spawnTime: number, data: Partial<EntityData> = {}) {
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
		this.rotation = data.rotation || 0
		this.motion   = new Dim3(...(data.motion   || [0, 0, 0]))
		this.size     = new Dim2()
		this.spawnTime = spawnTime
		this.attributes = new AttributeList(this.def)
		this.noGravity = typeof data.noGravity == "undefined" ? false : data.noGravity
		this.onGround  = typeof data.onGround == "undefined" ? false : data.onGround
		this.inFluid   = false
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

	get eyeHeight() {
		return this.attributes.get("generic.scale", 1)! * this.size.y * this.def.eyeHeight
	}

	get rotationAngle() {
		return this.rotation
	}

	get eyes() {
		return this.position.copy().add(new Dim2(0, this.eyeHeight))
	}

	getBoundingBox() {
		const size = this.size.copy().scale(this.attributes.get("generic.scale", 1)!)
		const pos = this.position.copy()
		pos.x -= size.x/2
		return new BoundingBox(pos, size)
	}

	tick(world: World) {
		const {x: pX, y: pY, z: pZ} = this.position // p -> present
		const box = this.getBoundingBox()
		let onGround = false
		let inFluid = false

		// check fluid collision
		loop: for (let y = Math.floor(box.pos.y); y <= Math.ceil(box.corner.y); y++) {
			for (let x = Math.floor(box.pos.x); x <= Math.ceil(box.corner.x); x++) {
				const block = world.getBlock(x, y, pZ)
				if (block && block.type == "fluid") {
					if (box.intersect(block?.getBoundingBox(x, y))) {
						inFluid = true
						break loop
					}
				}
			}
		}
		//console.log("inFluid:", inFluid)

		const motion = this.motion.copy()
		Entity.applyGravity(motion, inFluid)
		const fY = pY + motion.y // f -> future

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

		if (onGround && this.motion.y < 0) this.motion.y = 0

		// apply gravity
		if (!onGround && !this.noGravity) {
			Entity.applyGravity(this.motion, inFluid)
		}

		// ground friction
		if ((onGround || inFluid) && this.def.hasFriction) {
			this.motion.x *= 0.75
			if (Math.abs(this.motion.x) <= 0.5 ** 5) this.motion.x = 0
		}

		this.onGround = onGround
		this.inFluid  = inFluid

		this.position.add(this.motion)

		if (this.position.y < world.minY - 50) this.die(world)
	}

	draw(g: Graphics, world: World) {
		const block = world.getBlock(this.position.x, this.position.y, this.position.z)
		const light = block?.lightLevel ?? 15
		const box = this.getBoundingBox()

		g.save()
		g.translate(box.pos.x, box.pos.y)
		//g.translate(-box.size.x/2, 0) // to center (x)

		g.brightness(light / 15)
		this.texture?.draw(g, box.size.x, box.size.y)

		g.restore()
	}

	die(world: World) {
		world.removeEntity(this)
	}

	getData(world?: World): EntityData {
		return {
			id: this.id,
			motion: this.motion.asArray(),
			position: this.position.asArray(), // TODO: "pos" alias for compatibility
			rotation: this.rotation,
			noGravity: this.noGravity,
			onGround: this.onGround,
			spawnTime: this.spawnTime
		}
	}

}

export type EntityData = Flatten<BaseData & {
	motion: number[],
	position: number[],
	rotation: number,
	noGravity: boolean,
	onGround: boolean,
	spawnTime: number
}>
