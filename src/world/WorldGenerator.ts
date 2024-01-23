import Block from "../block/Block.js";
import { blockdefs } from "../main.js";
import World from "./World.js";
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"

export default class WorldGenerator {

    static flat(world: World) {
        for (let y = world.minY; y <= world.maxY && y <= 0; y++) {
            for (let x = world.minX; x <= world.maxX; x++) {
                if (y <= -3) world.setBlock(x, y, 0, new Block("tiny:stone"))
                else if(y < 0) world.setBlock(x, y, 0, new Block("tiny:dirt"))
                else if(y == 0) world.setBlock(x, y, 0, new Block("tiny:grass_block"))
            }
        }

		// for testing of world.save() and World.load()
		/*(async () => {
			let ysonSave = YSON.stringify(world.toYSON().blocks)
			let save = world.save()
			let saveLength = save.stringSave.length
			
			console.log("blocks:", world.toYSON().blocks)
			console.log("save:", save)
			console.log("space effi:", saveLength - ysonSave.length, ysonSave.length / saveLength + "x")
			console.log(saveLength, "new vs. old", ysonSave.length)

			let worldCopy = World.load(save.stringSave, save.dims, Array.from(save.entites))
			if (!worldCopy) {
				console.error("oh no")
				return
			}
			
			for (let z = worldCopy.minZ; z <= worldCopy.maxZ; z++) {
				for (let y = worldCopy.minY; y <= worldCopy.maxY; y++) {
					for (let x = worldCopy.minX; x <= worldCopy.maxX; x++) {
						if (world.getBlock(x, y, z)?.id != worldCopy.getBlock(x, y, z)?.id) {
							console.warn("wrong block at", x, y, z, "; block:", world.getBlock(x, y, z)?.id, worldCopy.getBlock(x, y, z)?.id)
						}
					}
				}
			}
		})()*/
    }

    static random(world: World) {
        let blockArray = Array.from(blockdefs.values())
        console.log(blockArray)

        for (let z = world.minZ; z <= world.maxZ; z++) {
            for (let y = world.minY; y <= world.maxY; y++) {
                for (let x = world.minX; x <= world.maxX; x++) {

                    let r = Math.floor(Math.random() * (blockArray.length + 5)) - 5
                    if (r < 0) r = 0
                    world.setBlock(x, y, z, new Block(blockArray[r]))

                }
            }
        }
    }

}
