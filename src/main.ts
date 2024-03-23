import * as gameMenuState from "./gui/state/gameMenu.js"
import * as ingameMenuState from "./gui/state/ingameMenu.js"
import * as ingameState from "./gui/state/ingame.js"
import { type NamespacedId, SoundDef } from "./util/interfaces.js"
import { isObject, validateArray, validateProperty, validateRecord } from "./util/typecheck.js"
import { $ } from "./util/util.js"
import AudioFile from "./sound/AudioFile.js"
import BlockDef from "./defs/BlockDef.js"
import { Button } from "./gui/Button.js"
import Container from "./util/Container.js"
import Entity from "./entity/Entity.js"
import EntityDef from "./defs/EntityDef.js"
import Graphics from "./Graphics.js"
import Hotbar from "./util/Hotbar.js"
import Input from "./Input.js"
import ItemDef from "./defs/ItemDef.js"
import MenuState from "./enums/MenuState.js"
import Sound from "./sound/Sound.js"
import Texture from "./texture/Texture.js"
import World from "./world/World.js"
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"

// eslint-disable-next-line no-console
console.log("Never Gonna Give You Up")

// game info
export const GAME_NAME = "TinyMC"
export const GAME_VERSION = ""
export const GAME_VERSION_BRANCH = "main" // TODO: determine from git

// canvas
export const game = $<HTMLCanvasElement>("#game")
const g = new Graphics(game, ingameState.blockSize)

// assets
const textures: Map<string, Texture> = new Map()

export const cursors = { openContainer: getTexture("tiny/textures/gui/cursors/open_container.png") } satisfies Record<string, Texture>
export const soundList: Record<string, SoundDef> = await fetch("./assets/tiny/sounds.json").then(res => res.json())
validateRecord( // should capture Record<string, SoundDef>
	"string",
	(value): value is object => isObject(value) && validateProperty(
		value,
		"sounds",
		validateArray((e): e is unknown => typeof e == "string" || (isObject(e) && validateProperty(e, "name", "string")))
	)
)(soundList)
const audioFiles: Map<string, AudioFile> = new Map()
const sounds: Map<string, Sound> = new Map()

// defs
export const blockdefs  = await loadDefs("blocks.yson",   BlockDef)
export const itemdefs   = await loadDefs("items.yson",    ItemDef)
export const entitydefs = await loadDefs("entities.yson", EntityDef)
blockdefs.set("tiny:air", new BlockDef("tiny", "air", {}))

// other
export const input = new Input()
export const debug = { showHitboxes: false, showOrigin: false, showDebugScreen: false, showAirLightLevel: false, showRange: false }
export let menuState: MenuState = MenuState.MENU

export function setMenuState(state: MenuState) {
	menuState = state
}

gameMenuState.loadTexture()
Button.loadAssets()
Hotbar.loadTexture()
Container.loadAssets()
Entity.loadAssets()
ingameState.init()

export const perf = {
	tick: [] as number[],
	draw: [] as number[],

	get mspt(): number {
		if (perf.tick.length <= 0) return 0

		let sum = 0

		perf.tick.forEach(v => (sum += v))

		return sum / perf.tick.length
	},

	get mspf(): number {
		if (perf.draw.length <= 0) return 0

		let sum = 0

		perf.draw.forEach(v => (sum += v))

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

function perfRun(name: "tick" | "draw", fn: () => void, target: number) {
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

async function loadDefs<T>(path: string, cls: { new(ns: string, id: string, data: unknown): T }): Promise<Map<NamespacedId, T>> {
	const data = await YSON.load(path)
	const defs = new Map<NamespacedId, T>()
	const namespaces = Object.keys(data)

	for (const ns of namespaces) {
		const ids = Object.keys(data[ns])

		for (const id of ids) defs.set(`${ns}:${id}`, new cls(ns, id, data[ns][id]))
	}

	return defs
}

export function getTexture(path: string) {
	let texture = textures.get(path)
	if (texture) if (texture.state != Texture.FAILED) return texture

	texture = new Texture(path)
	textures.set(path, texture)

	return texture
}

export function getAudioFile(path: string) {
	let audio = audioFiles.get(path)
	if (audio) if (audio.state != AudioFile.FAILED) return audio

	audio = new AudioFile(path)
	audioFiles.set(path, audio)

	return audio
}

export function getSound(key: string) {
	let sound = sounds.get(key)
	if (sound) return sound

	sound = new Sound(key)
	sounds.set(key, sound)

	return sound
}

function tick() {
	if (menuState == MenuState.INGAME) ingameState.tick()
}

function draw() {
	game.width  = innerWidth
	game.height = innerHeight
	game.style.width  = `${innerWidth}px`
	game.style.height = `${innerHeight}px`
	game.style.cursor = (menuState == MenuState.INGAME) ? "none" : "initial"

	if (menuState == MenuState.MENU || menuState == MenuState.WORLDSELECTION) gameMenuState.draw(g)
	else if (menuState == MenuState.INGAME) ingameState.draw(g)
	else if (menuState == MenuState.INGAME_MENU) {
		ingameState.draw(g)
		ingameMenuState.draw(g)
	} else throw new Error("unknown menu state")
}

export function saveGame() {
	if (menuState != MenuState.INGAME && menuState != MenuState.INGAME_MENU) return
	if (!ingameState.world) return

	const currentWorlds = JSON.parse(localStorage.getItem("worlds") || "[]")
	const currentWorldIndex = currentWorlds.findIndex((worldSave: { name: string, data: unknown }) => worldSave.name == ingameState.world.name)

	currentWorlds[currentWorldIndex] = {
		...currentWorlds[currentWorldIndex],
		...ingameState.world.save()
	}
	localStorage.setItem("worlds", JSON.stringify(currentWorlds))
}

export function saveNewWorld(world: World) {
	const currentWorlds = JSON.parse(localStorage.getItem("worlds") || "[]")

	currentWorlds.push({ ...world.save() })
	localStorage.setItem("worlds", JSON.stringify(currentWorlds))
}

window.addEventListener("beforeunload", () => {
	saveGame()
})

input.on("keydown", (key: string) => {
	if (key == "F11") {
		if (document.fullscreenElement) document.exitFullscreen()
		else game.requestFullscreen()

		return
	} else if (key == "Escape" && (menuState == MenuState.INGAME || menuState == MenuState.INGAME_MENU)) {
		menuState = menuState == MenuState.INGAME ? MenuState.INGAME_MENU : MenuState.INGAME
		if (menuState == MenuState.INGAME_MENU) saveGame()
	} else if (key == "Escape" && menuState == MenuState.WORLDSELECTION) setMenuState(MenuState.MENU)


	/* if (menuState == MenuState.MENU) gameMenuState.onKey(key)
	else*/ if (menuState == MenuState.INGAME) ingameState.onKey(key)
})

input.on("keypress", (key: string) => {
	/* if (menuState == MenuState.MENU) gameMenuState.whileKey(key)
	else*/ if (menuState == MenuState.INGAME) ingameState.whileKey(key)
})

input.on("click", (button: number) => {
	if (menuState == MenuState.MENU || menuState == MenuState.WORLDSELECTION) gameMenuState.onClick(button)
	else if (menuState == MenuState.INGAME) ingameState.onClick(button)
	else if (menuState == MenuState.INGAME_MENU) ingameMenuState.onClick(button)
})

input.on("mousemove", () => {
	/* if (menuState == MenuState.MENU) gameMenuState.onMouseMove()
	else*/ if (menuState == MenuState.INGAME) ingameState.onMouseMove()
})


