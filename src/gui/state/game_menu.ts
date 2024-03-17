import type Graphics from "../../Graphics.js"
import MenuState from "../../enums/MenuState.js"
import { game, getTexture, menuState, saveNewWorld, setCurrentWorldName, setMenuState } from "../../main.js"
import TextRenderer from "../../util/TextRenderer.js"
import { Button } from "../Button.js"
import * as ingame_state from "../../gui/state/ingame.js"
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import World from "../../world/World.js"
import Texture from "../../texture/Texture.js"

let widgetsTex
let logoTex: Texture
const singleplayerButton = new Button(0, 200, 800, 80, "Singleplayer")
const optionsButton = new Button(0, 300, 800, 80, "Options")
const quitButton = new Button(0, 400, 800, 80, "Quit")
let worldButtons: Button[] = []
const createWorldButton = new Button(0, 100, 800, 80, "Create World")

singleplayerButton.on("click", () => {
	worldButtons = []
	const worldSaves = JSON.parse(localStorage.getItem("worlds") || "[]");
	for (let i = 0; i < worldSaves.length; i++) {
		const worldSave = worldSaves[i]
		const button = new Button(0, 200 + i * 100, 800, 80, worldSave.name)
		button.on("click", () => {
			setCurrentWorldName(worldSave.name)
			const world = World.load(worldSave.stringBlocks, worldSave.blockData, worldSave.dims, worldSave.entities)
			if(!world) {
				alert("Failed to load world!")
				return
			}
			ingame_state.loadWorld(world, worldSave.players[0])
			setMenuState(MenuState.INGAME)
			world.spawn(ingame_state.player)
		})
		worldButtons.push(button)
	}
	setMenuState(MenuState.WORLDSELECTION);
})

optionsButton.on("click", () => {
	console.log("button 2 clicked")
})

quitButton.on("click", () => {
	try {
		window.close()
	} catch (e) {
		location.href = "about:blank"
	}
})

createWorldButton.on("click", () => {
	console.log("creating new world")
	ingame_state.init()
	setMenuState(MenuState.INGAME);
	setCurrentWorldName(prompt("World name") || "New World")
	saveNewWorld();
})

export function loadTexture() {
	widgetsTex = getTexture("tiny/textures/gui/widgets.png")
	logoTex = getTexture("tiny/textures/gui/logo.png")
}

export function draw(g: Graphics) {
	// game.width  = innerWidth
	// game.height = innerHeight
	// game.style.width  = innerWidth  + "px"
	// game.style.height = innerHeight + "px"
	// graphics.fillStyle = "#78A7FF"
	// graphics.ctx.fillRect(0, 0, game.width, game.height)
	// graphics.ctx.imageSmoothingEnabled = false

	const ctx = g.ctx
	ctx.reset()
	ctx.imageSmoothingEnabled = false

	// temp
	ctx.fillStyle = "#78A7FF"
	ctx.fillRect(0, 0, game.width, game.height)

	ctx.translate(game.width/2, 0)
	drawLogo(g)
	if(menuState == MenuState.MENU) drawMainMenu(g)
	else if(menuState == MenuState.WORLDSELECTION) drawWorldSelection(g)
}

function drawLogo(g: Graphics) {
	// ctx.textAlign = "center"
	// TextRenderer.drawText(ctx, "Tiny MC", 0, 90, {
	// 	font: { size: 80 },
	// 	color: "white"
	// })
	g.ctx.translate(-(424/2), 40)
	logoTex.draw(g, 424, 120, true)
	g.ctx.translate(424/2, -40)
}

function drawMainMenu(g: Graphics) {
	singleplayerButton.draw(g)
	optionsButton.draw(g)
	quitButton.draw(g)
}

function drawWorldSelection(g: Graphics) {
	createWorldButton.draw(g)
	if(worldButtons.length == 0) {
		TextRenderer.drawText(g.ctx, "No worlds found", 0, 400, {
			font: { size: 40 },
			color: "white"
		})
		return
	}
	for (let button of worldButtons) {
		button.draw(g)
	}
}

export function onClick(button: number) {
	if(menuState == MenuState.MENU) {
		singleplayerButton.click(button)
		optionsButton.click(button)
		quitButton.click(button)
	} else if(menuState == MenuState.WORLDSELECTION) {
		createWorldButton.click(button)
		for (let btn of worldButtons) {
			btn.click(button)
		}
	}
}