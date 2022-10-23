import BoundingBox from "./boundingbox.js"
import Dim2 from "./dim2.js"
import Dim3 from "./dim3.js"
import EntityDef from "./entitydef.js"
import { cam, debug, entitydefs, game } from "./main.js"
import Texture from "./texture.js"

export default class Entity {

	readonly def: EntityDef
	readonly position: Dim3
	readonly rotation: Dim3
	readonly motion: Dim3
	protected readonly size: Dim2

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
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	getBoundingBox() {
		let pos = this.position.copy()
		pos.x -= this.size.x/2
		return new BoundingBox(pos, this.size)
	}
	tick(world: World) {
		this.position.add(this.motion)
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
