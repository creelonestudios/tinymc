import ItemStack from "./itemstack.js";
import { getTexture } from "./main.js";
import Player from "./player.js";
import Texture from "./texture.js";

let widgets: Texture
const scale = 4
const itemSize = 48

export default class Hotbar {

    static loadTexture() {
        widgets = getTexture("tiny/textures/gui/widgets.png")
    }

    static drawHotbar(player: Player, ctx: any, canvasWidth: number, canvasHeight: number) {

        let x = canvasWidth / 2 - 204
        let y = canvasHeight - 100
        let hotbar = player.hotbar
    
        // first and last are diff b/c black outline
        ctx.drawImage(widgets.img, 0, 0, 21, 22, x, y, 21 * scale, 22 * scale)
        for (let i = 1; i < hotbar.size -1; i++) {
            ctx.drawImage(widgets.img, 21, 0, 20, 22, x + 21 * scale + (i-1) * 20 * scale, y, 20 * scale, 22 * scale)
        }
        ctx.drawImage(widgets.img, 161, 0, 21, 22, x + 21 * scale + (hotbar.size-2) * 20 * scale, y, 21 * scale, 22 * scale)

        for (let i = 0; i < hotbar.size; i++) {
            let stack = hotbar.get(i)
            if (stack.item.id == "tiny:air") continue

            let cx = x + scale*22/2 - itemSize/2 + i * 20 * scale
            let cy = y + scale*22/2 - itemSize/2
            ctx.drawImage(stack.item.texture?.img, cx, cy, itemSize, itemSize)
        }
    
    }

}