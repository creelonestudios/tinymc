import Graphics from "../../Graphics";
import MenuState from "../../enums/MenuState.js";
import { game, setMenuState } from "../../main.js";
import TextRenderer from "../../util/TextRenderer.js";
import { Button } from "../Button.js";

const continueButton = new Button(0, 400, 800, 80, "Continue")
const quitButton = new Button(0, 500, 800, 80, "Quit")

continueButton.on("click", () => {
	setMenuState(MenuState.INGAME)
})

quitButton.on("click", () => {
	setMenuState(MenuState.MENU)
})

export function draw(g: Graphics) {
	// Reset
	const ctx = g.ctx
	ctx.reset()
	ctx.imageSmoothingEnabled = false

	ctx.fillStyle = "#78A7FF"
	ctx.fillRect(0, 0, game.width, game.height)
	
	ctx.translate(game.width/2, 0)
	//

	ctx.textAlign = "center"
	TextRenderer.drawText(ctx, "Saved game!", 0, 90, {
		font: { size: 50 },
		color: "white"
	})
	continueButton.draw(g)
	quitButton.draw(g)
}

export function onClick(button: number) {
	continueButton.click(button)
	quitButton.click(button)
}