import BoundingBox from "./boundingbox.js"
import Dim2 from "./dim2.js"
import Dim3 from "./dim3.js"
import EntityDef from "./entitydef.js"
import { cam, debug, entitydefs, game } from "./main.js"
import World from "./world.js"

export default class Entity {

	static readonly TERMINAL_VELOCITY = 4

	readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3
	protected readonly size: Dim2
	#onGround: boolean

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
		this.#onGround = false
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	get onGround() {
		return this.#onGround
	}

	getBoundingBox() {
		let pos = this.position.copy()
		pos.x -= this.size.x/2
		return new BoundingBox(pos, this.size)
	}

	protected applyGravity() {
		if (Math.abs(this.motion.y) >= Entity.TERMINAL_VELOCITY) return
		this.motion.y -= 0.25
	}

	tick(world: World) {
		this.position.add(this.motion)
		let x = this.position.x
		let y = this.position.y
		let z = this.position.z
		let box = this.getBoundingBox()
		//console.log("----------------------------------------", x, y)
		this.#onGround = false
		let highestGround = null
		for (let i = Math.floor(x - box.size.x/2); i <= Math.ceil(x + this.size.x/2); i++) {
			for (let j = Math.floor(y - box.size.y/2); j <= Math.ceil(y + this.size.y/2); j++) {
				let block = world.getBlock(i, j, z)
				if (!block || block.id == "tiny:air") continue
				//console.log(i, j, block.id, box.intersect(block.getBoundingBox(i, j)))
				if (!box.intersect(block.getBoundingBox(i, j))) continue
				if (j < y) {
					this.#onGround = true
					if (highestGround == null || highestGround < j) highestGround = j
					this.motion.y = 0
				}
			}
		}
		console.log(this.id, highestGround, this.#onGround, this.position.y)
		if (highestGround != null && this.#onGround) {
			this.position.y = highestGround +1
		}
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) {
		if (!this.texture?.ready()) return

		let screenSize = this.size.copy().scale(blockSize)
		let screenX = Math.floor((x-0.5 - cam.x) *  blockSize + game.width /2) - (screenSize.x-blockSize)/2 // x-0.5 to center 
		let screenY = Math.floor((y-1   - cam.y) * -blockSize + game.height/2) - (screenSize.y-blockSize)   // y-1   because canvas draws downwards

		ctx.drawImage(this.texture.img, screenX, screenY, screenSize.x, screenSize.y)

		// hitbox
		if (debug.showHitboxes) {
			ctx.strokeStyle = "red"
			ctx.lineWidth = 1
			ctx.strokeRect(screenX, screenY, screenSize.x, screenSize.y)
		}
	}

}
