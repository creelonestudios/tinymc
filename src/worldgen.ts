import Block from "./block.js";
import { blockdefs } from "./main.js";
import World from "./world.js";

export default class WorldGenerator {

    static flat(world: World) {
        for (let y = world.minY; y <= world.maxY && y <= 0; y++) {
            for (let x = world.minX; x <= world.maxX; x++) {
                if (y <= -3) world.setBlock(x, y, 0, new Block("tiny:stone", x, y, 0))
                else if(y < 0) world.setBlock(x, y, 0, new Block("tiny:dirt", x, y, 0))
                else if(y == 0) world.setBlock(x, y, 0, new Block("tiny:grass_block", x, y, 0))
            }
        }
    }

    static random(world: World) {
        let blockArray = Array.from(blockdefs.values())
        console.log(blockArray)

        for (let z = world.minZ; z <= world.maxZ; z++) {
            for (let y = world.minY; y <= world.maxY; y++) {
                for (let x = world.minX; x <= world.maxX; x++) {

                    let r = Math.floor(Math.random() * (blockArray.length + 5)) - 5
                    if (r < 0) r = 0
                    world.setBlock(x, y, z, new Block(blockArray[r], x, y, z))

                }
            }
        }
    }

}