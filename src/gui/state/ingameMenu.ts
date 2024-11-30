import * as ingameState from "./ingame.js"
import Button from "../Button.js"
import Graphics from "../../Graphics.js"
import LightColor from "../../util/LightColor.js"
import MenuState from "../../enums/MenuState.js"
import { setMenuState } from "../../main.js"
import TextRenderer from "../../util/TextRenderer.js"

const continueButton = new Button(0, -100, 800, 80, "Continue")
const optionsButton = new Button(0, 0, 800, 80, "Options")
const quitButton = new Button(0, 100, 800, 80, "Quit")

continueButton.on("click", () => {
	setMenuState(MenuState.INGAME)
})

quitButton.on("click", () => {
	setMenuState(MenuState.MENU)
})

let day = true

optionsButton.on("click", () => { // temp
	day = !day
	ingameState.world.skyLightColor = day ? new LightColor(15, 15, 15) : new LightColor(4, 4, 5)
})

export function draw(g: Graphics) {
	const { ctx } = g

	ctx.translate(g.canvas.width/2, g.canvas.height/2) // center game

	ctx.textAlign = "center"
	TextRenderer.drawText(ctx, "Saved game!", 0, -280, {
		font:  { size: 50 },
		color: "white"
	})
	continueButton.draw(g)
	optionsButton.draw(g)
	quitButton.draw(g)
}

export function onClick(button: number) {
	continueButton.click(button)
	optionsButton.click(button)
	quitButton.click(button)
}

export function onKey(code: string, _key: string) {
	if (code == "Escape") {
		setMenuState(MenuState.INGAME)
	}
}
