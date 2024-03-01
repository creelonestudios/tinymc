import Graphics from "./Graphics.js";
import { game, getTexture } from "./main.js";
import { Button } from "./util/Button.js";

let widgetsTex;
let testButton = new Button(-400, 100, 10, 2, "Test Button");
let testButton2 = new Button(-400, 300, 10, 2, "Test Button 2");

export default class GameMenu {
	static loadTexture() {
		widgetsTex = getTexture("tiny/textures/gui/widgets.png");
	}

	static drawLogo(graphics: Graphics) {
		graphics.fillStyle = "white";
		graphics.ctx.font = "50px default regular";
		graphics.ctx.textAlign = "center";
		graphics.ctx.fillText("Tiny MC", 0, 70);
	}

	static drawMenu(graphics: Graphics) {
		testButton.draw(graphics);
		testButton2.draw(graphics);
	}
}