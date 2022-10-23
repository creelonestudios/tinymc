import Dim3 from "./dim3.js"
import EntityDef from "./entitydef.js"
import { cam, debug, entitydefs, game } from "./main.js"
import Texture from "./texture.js"

export default class Entity {

	protected readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3

	constructor(def: EntityDef | string) {
		if (def instanceof EntityDef) this.def = def
		else {
			let entitydef = entitydefs.get(def)
			if (entitydef) this.def = entitydef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
		this.position = new Dim3()
		this.rotation = new Dim3()
		this.motion   = new Dim3()
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	tick() {
		this.position.add(this.motion)
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number, size: number) {
		if (!this.texture?.ready()) return

		let screenX = Math.floor((x-0.5 - cam.x) *  blockSize + game.width /2) - (size-blockSize)/2 // x-0.5 to center 
		let screenY = Math.floor((y-1   - cam.y) * -blockSize + game.height/2) - (size-blockSize)   // y-1   because canvas draws downwards

		ctx.drawImage(this.texture.img, screenX, screenY, size, size)

		// hitbox
		if (debug.showHitboxes) {
			ctx.strokeStyle = "red"
			ctx.lineWidth = 1
			ctx.strokeRect(screenX, screenY, size, size)
		}
	}

}
