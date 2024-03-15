import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import BlockDef from "./defs/BlockDef.js"
import Texture from "./texture/Texture.js"
import ItemDef from "./defs/ItemDef.js"
import Hotbar from "./util/Hotbar.js"
import Input from "./Input.js"
import EntityDef from "./defs/EntityDef.js"
import { $ } from "./util/util.js"
import Container from "./util/Container.js"
import MenuState from "./enums/MenuState.js"
import * as game_menu_state from "./gui/state/game_menu.js"
import * as ingame_menu_state from "./gui/state/ingame_menu.js"
import * as ingame_state from "./gui/state/ingame.js"
import { Button } from "./gui/Button.js"
import { type NamespacedId } from "./util/interfaces.js"
import Graphics from "./Graphics.js"

console.log("Never Gonna Give You Up")

// game info
export const GAME_NAME = "TinyMC"
export const GAME_VERSION = ""
export const GAME_VERSION_BRANCH = "main" // TODO: determine from git

// canvas
export const game = $<HTMLCanvasElement>("#game")
const g = new Graphics(game, ingame_state.blockSize)

// assets
const textures: Map<String, Texture> = new Map()
export const cursors = {
	open_container: getTexture("tiny/textures/gui/cursors/open_container.png")
} satisfies Record<string, Texture>

// defs
export const blockdefs  = await loadDefs<BlockDef>("blocks.yson", BlockDef)
export const itemdefs   = await loadDefs<ItemDef>("items.yson", ItemDef)
export const entitydefs = await loadDefs<EntityDef>("entities.yson", EntityDef)
blockdefs.set("tiny:air", new BlockDef("tiny", "air", {}))

// other
export const input = new Input()
export const debug = { showHitboxes: false, showOrigin: false, showDebugScreen: false, showAirLightLevel: false, showRange: false }
export let menuState: MenuState = MenuState.MENU
export let currentWorldName: string | null = null

export function setMenuState(state: MenuState) {
	menuState = state
}

export function setCurrentWorldName(name: string | null) {
	currentWorldName = name
}

game_menu_state.loadTexture()
Button.loadTexture()
Hotbar.loadTexture()
Container.loadTexture()

export const perf = {
	tick: [] as number[],
	draw: [] as number[],

	get mspt(): number {
		if (perf.tick.length <= 0) return 0
		let sum = 0
		perf.tick.forEach(v => sum += v)
		return sum / perf.tick.length
	},

	get mspf(): number {
		if (perf.draw.length <= 0) return 0
		let sum = 0
		perf.draw.forEach(v => sum += v)
		return sum / perf.draw.length
	},

	get tps(): number {
		if (perf.mspt <= 0) return 0
		return Math.min(1000 / perf.mspt, tickTarget)
	},

	get fps(): number {
		if (perf.mspf <= 0) return 0
		return Math.min(1000 / perf.mspf, drawTarget)
	}
}
export const tickTarget = 20
export const drawTarget = 20
const perfTick = perfRun("tick", tick, 1000/tickTarget)
const perfDraw = perfRun("draw", draw, 1000/drawTarget)
setInterval(perfTick, 1000/tickTarget)
setInterval(() => requestAnimationFrame(perfDraw), 1000/drawTarget)

function perfRun(name: "tick" | "draw", fn: Function, target: number) {
	return () => {
		const before = performance.now()
		fn()
		const timeElapsed = performance.now() - before
		if (timeElapsed >= 1000) console.warn(`game lagging: last ${name} took ${timeElapsed}ms`)
		else if (timeElapsed >= target) console.debug(`%cgame lagging: last ${name} took ${timeElapsed}ms`, "color: skyblue")
		perf[name].push(timeElapsed)
		if (perf[name].length > 50) perf[name].shift()
	}
}

async function loadDefs<T>(path: string, cls: any): Promise<Map<NamespacedId, T>> {
	let data = await YSON.load(path)
	let defs = new Map<NamespacedId, T>()
	let namespaces = Object.keys(data)

	for (let ns of namespaces) {
		let ids = Object.keys(data[ns])

		for (let id of ids) {
			defs.set(`${ns}:${id}`, new cls(ns, id, data[ns][id]))
		}
	}
	return defs
}

export function getTexture(path: string) {
	let texture = textures.get(path)
	if (texture) {
		if (texture.state != Texture.FAILED) return texture
	}
	texture = new Texture(path)
	textures.set(path, texture)
	return texture
}

function tick() {
	if (menuState == MenuState.INGAME) ingame_state.tick()
}

function draw() {
	game.width  = innerWidth
	game.height = innerHeight
	game.style.width  = innerWidth  + "px"
	game.style.height = innerHeight + "px"
	game.style.cursor = (menuState == MenuState.INGAME) ? "none" : "initial"

	if (menuState == MenuState.MENU || menuState == MenuState.WORLDSELECTION) game_menu_state.draw(g)
	else if (menuState == MenuState.INGAME) ingame_state.draw(g)
	else if (menuState == MenuState.INGAME_MENU) {
		// ingame_state.draw(g)
		ingame_menu_state.draw(g)
	}
	else alert("unknown menu state")
}

function saveGame() {
	if(!(menuState == MenuState.INGAME || menuState == MenuState.INGAME_MENU)) return
	const currentWorlds = JSON.parse(localStorage.getItem("worlds") || "[]");
	let currentWorldIndex = currentWorlds.findIndex((world: { name: string; data: any; }) => world.name == currentWorldName);
	currentWorlds[currentWorldIndex] = {
		...currentWorlds[currentWorldIndex],
		...ingame_state.world.save()
	}
	localStorage.setItem("worlds", JSON.stringify(currentWorlds))
	console.log("Game saved");
}

window.addEventListener("beforeunload", () => {
	saveGame()
});

input.on("keydown", (key: string) => {
	if (key == "F11") {
		if (document.fullscreenElement) document.exitFullscreen()
		else game.requestFullscreen()
		return
	} else if(key == "Escape" && (menuState == MenuState.INGAME || menuState == MenuState.INGAME_MENU)) {
		menuState = menuState == MenuState.INGAME ? MenuState.INGAME_MENU : MenuState.INGAME
		if(menuState == MenuState.INGAME_MENU) {
			saveGame()
		}
	} else if(key == "Escape" && menuState == MenuState.WORLDSELECTION) {
		setMenuState(MenuState.MENU)
	}

	/*if (menuState == MenuState.MENU) game_menu_state.onKey(key)
	else*/ if (menuState == MenuState.INGAME) ingame_state.onKey(key)
})

input.on("keypress", (key: string) => {
	/*if (menuState == MenuState.MENU) game_menu_state.whileKey(key)
	else*/ if (menuState == MenuState.INGAME) ingame_state.whileKey(key)
})

input.on("click", (button: number) => {
	if (menuState == MenuState.MENU || menuState == MenuState.WORLDSELECTION) game_menu_state.onClick(button)
	else if (menuState == MenuState.INGAME) ingame_state.onClick(button)
	else if (menuState == MenuState.INGAME_MENU) ingame_menu_state.onClick(button)
})

input.on("mousemove", () => {
	/*if (menuState == MenuState.MENU) game_menu_state.onMouseMove()
	else*/ if (menuState == MenuState.INGAME) ingame_state.onMouseMove()
})


