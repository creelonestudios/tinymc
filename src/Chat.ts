/* eslint-disable object-curly-newline */
import { game, GAME_NAME, GAME_VERSION, GAME_VERSION_BRANCH } from "./main.js"
import Graphics from "./Graphics.js"
import { player } from "./gui/state/ingame.js"
import YSON from "https://j0code.github.io/yson/YSON.js"

export default class Chat {

	open: boolean
	block: boolean
	private history: string[]
	private input: string

	constructor() {
		this.open = false
		this.block = true
		this.history = []
		this.input = ""
	}

	send(msg: string) {
		this.history.push(...msg.split("\n"))
	}

	draw(g: Graphics) {
		g.save()

		// chat history
		g.save()
		g.ctx.translate(2, 2)
		for (const line of this.history) {
			const offset = g.drawText(line, {
				font: {
					size: 30
				},
				color:   "white",
				drawBg:  true,
				padding: 2
			})

			g.ctx.translate(0, offset)
		}

		g.restore()

		// chat input
		g.save()
		g.ctx.translate(0, game.height)
		g.ctx.translate(2, -2)
		g.ctx.textBaseline = "bottom"
		g.drawText(`> ${this.input}`, {
			font: {
				size: 30
			},
			color:   "white",
			drawBg:  true,
			padding: 2
		})
		g.restore()

		g.restore()
	}

	whileKey(code: string, key: string) {
		if (this.block) return

		if (key.length == 1) this.input += key
		else if (code == "Backspace") this.input = this.input.substring(0, this.input.length - 1)
		else if (code == "Enter") {
			const input = this.input.trim()

			if (input) {
				this.send(`<${player.name}> ${input}`)

				// primitive cmd sys (replace later lol)
				if (input == "/version") {
					this.send(`${GAME_NAME} ${GAME_VERSION} on ${GAME_VERSION_BRANCH}`)
				} else if (input == "/playerdata") {
					const data = player.getData()

					this.send(YSON.stringify(data, { space: "  ", inlineChildren: 3 })!)
				}
			}

			this.input = ""
			this.open = false
		} else if (code == "Escape") {
			this.input = ""
			this.open = false
		}
	}

	onKeyUp(_code: string) {
		this.block = false
	}

}
