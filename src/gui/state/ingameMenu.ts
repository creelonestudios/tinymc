import { Button } from "../Button.js"
import Graphics from "../../Graphics.js"
import MenuState from "../../enums/MenuState.js"
import TextRenderer from "../../util/TextRenderer.js"
import { setMenuState } from "../../main.js"

const continueButton = new Button(0, -100, 800, 80, "Continue")
const optionsButton = new Button(0, 0, 800, 80, "Options")
const quitButton = new Button(0, 100, 800, 80, "Quit")

continueButton.on("click", () => {
	setMenuState(MenuState.INGAME)
})

quitButton.on("click", () => {
	setMenuState(MenuState.MENU)
})

export function draw(g: Graphics) {
	const { ctx } = g

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