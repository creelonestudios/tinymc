import Block from "../block/Block.js";
import { blockdefs } from "../main.js";
import { type NamespacedId } from "../util/interfaces.js";
import World from "./World.js";
import YSON from "https://j0code.github.io/browserjs-yson/main.mjs"

export default class WorldGenerator {

    static flat(world: World) {
        for (let y = world.minY; y <= world.maxY && y <= 0; y++) {
            for (let x = world.minX; x <= world.maxX; x++) {
				let blockId: NamespacedId
                if (y < -3) blockId = "tiny:stone"
                else if(y < -1) blockId = "tiny:dirt"
                else if(y == -1) blockId = "tiny:grass_block"
				else continue

				for (let z = world.minZ; z <= 0; z++) {
					world.setBlock(x, y, z, new Block(blockId))
				}
            }
        }

		for (let x = world.minX; x <= world.maxX; x++) {
			for (let z = world.minZ; z <= world.maxZ; z++) {
				world.scheduleBlockUpdate(x, world.maxY, z)
			}
		}

		// for testing of world.save() and World.load()
		/*(async () => {
			let ysonSave = YSON.stringify(world.toYSON().blocks)
			let save = world.save()
			let saveLength = save.stringBlocks.length
			
			console.log("blocks:", world.toYSON().blocks)
			console.log("save:", save)
			console.log("space effi:", saveLength - ysonSave.length, ysonSave.length / saveLength + "x")
			console.log(saveLength, "new vs. old", ysonSave.length)

			let worldCopy = World.load(save.stringBlocks, save.blockData, save.dims, save.entities)
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
