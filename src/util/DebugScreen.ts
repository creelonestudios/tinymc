import Graphics from "../Graphics.js"
import Player from "../entity/Player.js"
import { game, getFirstBlock, getFirstFluid, getMouseBlock, input } from "../main.js"
import World from "../world/World.js"

export default class DebugScreen {

	static draw(g: Graphics, world: World, player: Player) {
		const ctx = g.ctx
		const mouseBlock = getMouseBlock()
		const lookingAt = getFirstBlock(world, mouseBlock.x, mouseBlock.y)
		lookingAt.block = lookingAt.block
		const lookingAtFluid = getFirstFluid(world, mouseBlock.x, mouseBlock.y)

		ctx.save()
		ctx.translate(-game.width/2, -game.height/2) // uncenter
		ctx.translate(2, 2)
		ctx.fillStyle = "lime"
		ctx.textAlign = "left"
		ctx.textBaseline = "top"

		const lines = []

		lines.push(`player: (${player.position.x},${player.position.y})`)
		lines.push(`entities: ${world.getAllEntities().length}`)
		lines.push(`world size: ${world.minX}..${world.maxX}; ${world.minY}..${world.maxY}; ${world.minZ}..${world.maxZ}`)
		lines.push(`shift: ${input.pressed("ShiftLeft")}`)
		lines.push(`mouse: (${mouseBlock.x},${mouseBlock.y})`)

		if (lookingAt.block) {
			//console.log(mouseBlock, lookingAt.block.light)
			lines.push(`looking at: ${lookingAt.block.id}`)
			lines.push(`  light: ${lookingAt.block.lightLevel} (${lookingAt.block.skyLight} ${lookingAt.block.blockLight})`)
		}

		if (lookingAtFluid.block && lookingAtFluid.block.type == "fluid") {
			lines.push(`looking at fluid: ${lookingAtFluid.block.id}`)
			lines.push(`  light: ${lookingAtFluid.block.lightLevel} (${lookingAtFluid.block.skyLight} ${lookingAtFluid.block.blockLight})`)
		}

		const offset = g.drawText(lines[0], { drawBg: true })
		for (let i = 1; i < lines.length; i++) {
			ctx.translate(0, offset)
			g.drawText(lines[i], { drawBg: true })
		}

		ctx.restore()
	}

}
