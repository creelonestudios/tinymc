import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"
import Block from "./block.js"
import Texture from "./texture.js"

console.log("Never Gonna Give You Up")

function $(q: string) {
	return document.querySelector(q)
}

const blocks: Map<String, Block> = await YSON.load("blocks.yson", [Block])
const grid: Block[][] = []
const textures: Map<String,Texture> = new Map()
const blockSize = 80
const cam = [8, 5, 0]
const mouse = [0, 0]

for (let b of blocks.values()) {
	if (b.id == "tiny:air") continue
	const path = b.assetsPath
	let texture = new Texture(path)
	textures.set(path, texture)
	b.texture = texture
}
const skin = new Texture("tiny/textures/skin/jens/jens.png")
textures.set("tiny/textures/skin/jens/jens.png", skin)

fillGrid()
setInterval(() => requestAnimationFrame(draw), 100)

function fillGrid() {
	let blockArray = Array.from(blocks.values())
	for (let i = 0; i < 12; i++) {
		let row = []
		for (let j = 0; j < 16; j++) {
			let r = Math.floor(Math.random() * blocks.size)
			row.push(blockArray[r])
		}
		grid.push(row)
	}
}

function draw() {
	const game: any = $("#game")
	game.width  = innerWidth
	game.height = innerHeight
	game.style.width  = innerWidth  + "px"
	game.style.height = innerHeight + "px"

	const ctx = game.getContext("2d")
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, game.width, game.height)
	ctx.imageSmoothingEnabled = false

	// blocks
	for (let i in grid) {
		for (let j in grid[i]) {
			const block = grid[i][j]
			if (!block.texture || !grid[i][j].texture?.ready()) continue

			let x = Math.floor((Number(j) - cam[0]) *  blockSize + game.width/2)
			let y = Math.floor((Number(i) - cam[1]) * -blockSize + game.height/2)
			//console.log(Number(j) - cam[0], Number(i) + cam[1])
			//ctx.fillStyle = grid[i][j].color
			//ctx.fillRect(x, y, blockSize, blockSize)

			ctx.drawImage(block.texture.img, x, y, blockSize, blockSize)
		}
	}

	// block highlight
	{
		let x =  Math.floor((mouse[0] - game.width/2  + cam[0]*blockSize) / blockSize)
		let y = -Math.floor((mouse[1] - game.height/2 - cam[1]*blockSize) / blockSize)
		console.log(x, y)
		let x1 = Math.floor((x - cam[0]) *  blockSize + game.width/2)
		let y1 = Math.floor((y - cam[1]) * -blockSize + game.height/2)
		ctx.fillStyle = "transparent"
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2
		ctx.strokeRect(x1 /*+ 0.5*/, y1 /*+ 0.5*/, blockSize /*- 1*/, blockSize /*- 1*/) // +0.5 and -1 to align the lines in the pixel grid
	}

	// player
	{
		let x = Math.floor(-0.25 *  blockSize + game.width/2)
		let y = Math.floor(0.5 * -blockSize + game.height/2)
		if (skin.ready()) {
			ctx.drawImage(skin.img, x, y, blockSize*1.5, blockSize*1.5)
		}
	}
}

window.addEventListener("keydown", e => {
	if (e.key == "w") cam[1] += 0.25
	if (e.key == "a") cam[0] -= 0.25
	if (e.key == "s") cam[1] -= 0.25
	if (e.key == "d") cam[0] += 0.25
})

window.addEventListener("mousemove", e => {
	mouse[0] = e.x
	mouse[1] = e.y
})
