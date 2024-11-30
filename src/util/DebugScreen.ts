import { drawTarget, game, GAME_NAME, GAME_VERSION, GAME_VERSION_BRANCH, input, perf, tickTarget } from "../main.js"
import { getFirstBlock, getFirstFluid, getMouseBlock } from "../gui/state/ingame.js"
import Graphics from "../Graphics.js"
import Player from "../entity/Player.js"
import World from "../world/World.js"

export default class DebugScreen {

	static draw(g: Graphics, world: World, player: Player) {
		const { ctx } = g

		ctx.save()
		ctx.fillStyle = "lime"
		ctx.textBaseline = "top"
		gameInfo(g, world, player)
		envInfo(g)
		ctx.restore()
	}

}

function gameInfo(g: Graphics, world: World, player: Player) {
	const { ctx } = g
	const mouseBlock = getMouseBlock()
	const lookingAt = getFirstBlock(world, mouseBlock.x, mouseBlock.y, undefined, block => block.type != "fluid")
	const lookingAtFluid = getFirstFluid(world, mouseBlock.x, mouseBlock.y)

	ctx.save()
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
	lines.push(`pos: ${Math.floor(player.position.x * 1000) / 1000}, ${Math.floor(player.position.y * 1000) / 1000}`)
	lines.push(`motion: ${player.motion.x.toFixed(3)}, ${player.motion.y.toFixed(3)} (${player.motion.mag().toFixed(2)}/s)`)
	lines.push(`rotation: ${player.rotationAngle.toFixed(3)} (${(player.rotationAngle * 180 / Math.PI).toFixed(1)}°)`)
	lines.push(`mouse: ${mouseBlock.x}, ${mouseBlock.y}`)

	if (lookingAt.block) {
		lines.push(``)
		lines.push(`looking at block: ${mouseBlock.x}, ${mouseBlock.y}, ${lookingAt.z}`)
		lines.push(`${lookingAt.block.id}`)
		lines.push(`light: ${lookingAt.block.lightColor(world).debug} (${lookingAt.block.skyLight} sky, ${lookingAt.block.blockLight.debug} block)`)
	}

	if (lookingAtFluid.block && lookingAtFluid.block.type == "fluid") {
		lines.push(``)
		lines.push(`looking at fluid: ${mouseBlock.x}, ${mouseBlock.y}, ${lookingAtFluid.z}`)
		lines.push(`${lookingAtFluid.block.id}`)
		lines.push(`light: ${lookingAtFluid.block.lightColor(world).debug} (${lookingAtFluid.block.skyLight} sky, ${lookingAtFluid.block.blockLight.debug} block)`)
	}

	const offset = g.drawText(lines[0], { drawBg: true, padding: 3, font: { size: 20 }, shadow: false })

	for (let i = 1; i < lines.length; i++) {
		ctx.translate(0, offset)
		g.drawText(lines[i], { drawBg: true, padding: 3, font: { size: 20 }, shadow: false })
	}

	ctx.restore()
}

// might want to look into:
// - performance.measureUserAgentSpecificMemory()
// - performance.memory
function envInfo(g: Graphics) { // some of this might break
	const { ctx } = g

	ctx.save()
	ctx.translate(game.width, 0) // -> top right corner
	ctx.translate(-2, 2)
	ctx.textAlign = "right"

	const lines = []

	// @ts-expect-error ik it's using non-standard functionality
	const browser = navigator.userAgent.split(" ").at(-1).split("/") || {} // navigator.userAgentData?.brands.find(b => b.brand != "Not A(Brand") ||
	// @ts-expect-error ik it's using non-standard functionality
	const memTotal =  (navigator.deviceMemory*1000) || (performance.memory?.jsHeapSizeLimit/1_000_000) || 0

	// @ts-expect-error ik it's using non-standard functionality
	const memUsage = performance.memory?.usedJSHeapSize / 1_000_000

	// @ts-expect-error ik it's using non-standard functionality
	const memAllocated = performance.memory?.totalJSHeapSize / 1_000_000

	lines.push(`${browser[0] || "Unknown"} ${browser[1]?.split(".")[0] || "??"}`) // browser.brand ||; browser.version ||
	// @ts-expect-error ik it's using non-standard functionality
	lines.push(navigator.platform || navigator.userAgentData?.platform || navigator.oscpu || "Unknown")

	if (memUsage) lines.push(`Mem: ${(memUsage / memTotal * 100).toFixed(1)}% ${memUsage.toFixed(1)}/${memTotal}MiB`)
	else lines.push(`Mem: ${memTotal || 0}GiB`)
	if (memAllocated) lines.push(`Allocated: ${(memAllocated / memTotal * 100).toFixed(1)}% ${memAllocated.toFixed(1)}MiB`)

	lines.push(`Display: ${game.width}x${game.height}`)

	const offset = g.drawText(lines[0], { drawBg: true, padding: 3, font: { size: 20 }, shadow: false })

	for (let i = 1; i < lines.length; i++) {
		ctx.translate(0, offset)
		g.drawText(lines[i], { drawBg: true, padding: 3, font: { size: 20 }, shadow: false })
	}

	ctx.restore()
}
