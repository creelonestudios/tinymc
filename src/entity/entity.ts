import BoundingBox from "../boundingbox.js"
import Dim2 from "../dim/dim2.js"
import Dim3 from "../dim/dim3.js"
import EntityDef from "../defs/entitydef.js"
import { blockSize, entitydefs } from "../main.js"
import World from "../world/world.js"
import Graphics from "../Graphics.js"

export default class Entity {

	readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3
	protected readonly size: Dim2
	readonly spawnTime: number

	constructor(def: EntityDef | string, position: Dim3) {
		if (def instanceof EntityDef) this.def = def
		else {
			let entitydef = entitydefs.get(def)
			if (entitydef) this.def = entitydef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
		this.position = position
		this.rotation = new Dim3()
		this.motion   = new Dim3()
		this.size     = new Dim2()
		this.spawnTime = Date.now() // TODO: ticks since world creation
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
		g.translate(-this.size.x/2, -1 + this.size.y) // to center
		g.scale(this.size.x, this.size.y)		

		this.texture?.draw(g)

		g.restore()
	}

	drawHitbox(g: Graphics) {
		g.save()
		g.translate(this.x, this.y)
		g.translate(-this.size.x/2, -1 + this.size.y) // to center
		g.scale(this.size.x, this.size.y)		

		// hitbox
		g.strokeStyle = "red"
		g.lineWidth = 1 / blockSize
		g.strokeRect(0, 0, 1, 1)

		g.restore()
	}

}
