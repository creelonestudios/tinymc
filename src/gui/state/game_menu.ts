import type Graphics from "../../Graphics.js"
import { game, getTexture } from "../../main.js"
import TextRenderer from "../../util/TextRenderer.js"
import { Button } from "../Button.js"

let widgetsTex
const testButton = new Button(0, 100, 800, 80, "Test Button")
const testButton2 = new Button(0, 300, 800, 80, "Test Button 2")

testButton.on("click", () => {
	console.log("button 1 clicked")
})

testButton2.on("click", () => {
	console.log("button 2 clicked")
})

export function loadTexture() {
	widgetsTex = getTexture("tiny/textures/gui/widgets.png")
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
	drawLogo(ctx)
	drawMenu(g)
}

function drawLogo(ctx: CanvasRenderingContext2D) {
	ctx.textAlign = "center"
	TextRenderer.drawText(ctx, "Tiny MC", 0, 90, {
		font: { size: 80 },
		color: "white"
	})
}

function drawMenu(g: Graphics) {
	testButton.draw(g)
	testButton2.draw(g)
}

export function onClick(button: number) {
	testButton.click(button)
	testButton2.click(button)
}