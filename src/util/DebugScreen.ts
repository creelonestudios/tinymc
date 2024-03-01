import Graphics from "../Graphics.js"
import Player from "../entity/Player.js"
import { getFirstBlock, getFirstFluid, getMouseBlock } from "../gui/state/ingame.js"
import { GAME_NAME, GAME_VERSION, GAME_VERSION_BRANCH, drawTarget, game, input, perf, tickTarget } from "../main.js"
import World from "../world/World.js"

export default class DebugScreen {

	static draw(g: Graphics, world: World, player: Player) {
		const ctx = g.ctx
		ctx.save()
		ctx.fillStyle = "lime"
		ctx.textBaseline = "top"
		gameInfo(g, world, player)
		envInfo(g)
		ctx.restore()
	}

}

function gameInfo(g: Graphics, world: World, player: Player) {
	const ctx = g.ctx
	const mouseBlock = getMouseBlock()
	const lookingAt = getFirstBlock(world, mouseBlock.x, mouseBlock.y)
	lookingAt.block = lookingAt.block
	const lookingAtFluid = getFirstFluid(world, mouseBlock.x, mouseBlock.y)

	ctx.save()
	ctx.translate(-game.width/2, -game.height/2) // uncenter
	ctx.translate(2, 2)
	ctx.textAlign = "left"

	const lines = []

	lines.push(`${GAME_NAME} ${GAME_VERSION} (${GAME_VERSION_BRANCH})`)
	lines.push(`${perf.fps.toFixed(1)}/${drawTarget} fps (${perf.mspf.toFixed(2)}ms / frame)`)
	lines.push(`${perf.tps.toFixed(1)}/${tickTarget} tps (${perf.mspt.toFixed(2)}ms / tick)`)
	lines.push(`entities: ${world.getAllEntities().length}`)
	lines.push(`world size: ${world.minX}..${world.maxX}; ${world.minY}..${world.maxY}; ${world.minZ}..${world.maxZ}`)
	lines.push(`shift: ${input.keyPressed("ShiftLeft")}`)

	lines.push(``)
	lines.push(`player: (${player.position.x},${player.position.y})`)
	lines.push(`mouse: (${mouseBlock.x},${mouseBlock.y})`)

	if (lookingAt.block) {
		lines.push(``)
		lines.push(`looking at: ${mouseBlock.x}, ${mouseBlock.y}, ${lookingAt.z}`)
		lines.push(`${lookingAt.block.id}`)
		lines.push(`light: ${lookingAt.block.lightLevel} (${lookingAt.block.skyLight} sky, ${lookingAt.block.blockLight} block)`)
	}

	if (lookingAtFluid.block && lookingAtFluid.block.type == "fluid") {
		lines.push(``)
		lines.push(`looking at fluid: ${mouseBlock.x}, ${mouseBlock.y}, ${lookingAtFluid.z}`)
		lines.push(`${lookingAtFluid.block.id}`)
		lines.push(`light: ${lookingAtFluid.block.lightLevel} (${lookingAtFluid.block.skyLight} sky, ${lookingAtFluid.block.blockLight} block)`)
	}

	const offset = g.drawText(lines[0], { drawBg: true, padding: 3 })
	for (let i = 1; i < lines.length; i++) {
		ctx.translate(0, offset)
		g.drawText(lines[i], { drawBg: true, padding: 3 })
	}

	ctx.restore()
}

// might want to look into:
// - performance.measureUserAgentSpecificMemory()
// - performance.memory
function envInfo(g: Graphics) { // some of this might break
	const ctx = g.ctx

	ctx.save()
	ctx.translate(game.width/2, -game.height/2) // uncenter (-> top right corner)
	ctx.translate(-2, 2)
	ctx.textAlign = "right"

	const lines = []

	// @ts-expect-error
	const browser = navigator.userAgentData?.brands.find(b => b.brand != "Not A(Brand") || navigator.userAgent.split(" ").at(-1).split("/") || {}
	// @ts-expect-error
	const memTotal =  (navigator.deviceMemory*1000) || (performance.memory?.jsHeapSizeLimit/1_000_000) || 0
	// @ts-expect-error
	const memUsage = performance.memory?.usedJSHeapSize / 1_000_000
	// @ts-expect-error
	const memAllocated = performance.memory?.totalJSHeapSize / 1_000_000

	lines.push(`${browser.brand || browser[0] || "Unknown"} ${browser.version || browser[1]?.split(".")[0] || "??"}`)
	// @ts-expect-error
	lines.push(navigator.platform || navigator.userAgentData?.platform || navigator.oscpu || "Unknown")

	if (memUsage) lines.push(`Mem: ${(memUsage / memTotal * 100).toFixed(1)}% ${memUsage.toFixed(1)}/${memTotal}MiB`)
	else lines.push(`Mem: ${memTotal || 0}GiB`)
	if (memAllocated) lines.push(`Allocated: ${(memAllocated / memTotal * 100).toFixed(1)}% ${memAllocated.toFixed(1)}MiB`)

	lines.push(`Display: ${game.width}x${game.height}`)

	const offset = g.drawText(lines[0], { drawBg: true, padding: 3 })
	for (let i = 1; i < lines.length; i++) {
		ctx.translate(0, offset)
		g.drawText(lines[i], { drawBg: true, padding: 3 })
	}

	ctx.restore()
}
