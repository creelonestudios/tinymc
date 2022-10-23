import BlockDef from "./blockdef.js"
import { blockdefs, cam, debug, game } from "./main.js"

export default class Block {

	static fromYSON(data: any) {
		if (!(data instanceof Object) || typeof data.id != "string") throw new Error("Could not parse Block:", data)
		return new Block(data.id)
	}

	private readonly def: BlockDef

	constructor(def: BlockDef | string) {
		if (def instanceof BlockDef) this.def = def
		else {
			let blockdef = blockdefs.get(def)
			if (blockdef) this.def = blockdef
			else {
				console.trace()
				throw "Block definition not found: " + def
			}
		}
	}

	get id() {
		return this.def.id
	}

	get texture() {
		return this.def.texture
	}

	get maxItemStack() {
		return this.def.maxItemStack
	}

	update() {

	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
		if (!this.texture || !this.texture.ready()) return

		let screenX = Math.floor((x-0.5 - cam.x) *  size + game.width /2) // x-0.5 to center 
		let screenY = Math.floor((y-1   - cam.y) * -size + game.height/2) // y-1   because canvas draws downwards
		
		ctx.drawImage(this.texture.img, screenX, screenY, size, size)

		// hitbox
		if (debug.showHitboxes) {
			ctx.strokeStyle = "blue"
			ctx.lineWidth = 1
			ctx.strokeRect(screenX, screenY, size, size)
		}
	}

	toYSON() {
		return {
			id: this.id
		}
	}

}