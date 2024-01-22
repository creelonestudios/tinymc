import ItemStack from "./itemstack.js";
import { game, getTexture, player } from "./main.js";
import Player from "./player.js";
import Subtexture from "./subtexture.js";
import Texture from "./texture.js";

let widgets: Texture
let leftSlot: Subtexture
let middleSlot: Subtexture
let rightSlot: Subtexture
let selector: Subtexture

const scale = 4
const itemSize = 48

export default class Hotbar {

    static loadTexture() {
        widgets = getTexture("tiny/textures/gui/widgets.png")
        leftSlot = widgets.getSubtexture(0, 0, 21, 22)
        middleSlot = widgets.getSubtexture(21, 0, 20, 22)
        rightSlot = widgets.getSubtexture(161, 0, 21, 22)
        selector = widgets.getSubtexture(0, 22, 24, 24)
    }

    static drawHotbar(ctx: CanvasRenderingContext2D) {
        let hotbar = player.hotbar

        ctx.save()
        ctx.translate(-204, game.height/2 - 100)

        ctx.save()
        ctx.scale(scale, scale)

        // first and last are diff b/c black outline
        ctx.save()
        ctx.scale(21, 22)
        leftSlot.draw(ctx)
        ctx.restore()
        
        ctx.save()
        ctx.translate(21, 0)
        ctx.scale(20, 22)
        for (let i = 1; i < hotbar.size -1; i++) {
            middleSlot.draw(ctx)
            ctx.translate(1, 0)
        }
        ctx.restore()

        ctx.save()
        ctx.translate(21 + (hotbar.size-2) * 20, 0)
        ctx.scale(21, 22)
        rightSlot.draw(ctx)
        ctx.restore()

        ctx.restore()

        for (let i = 0; i < hotbar.size; i++) {
            let stack = hotbar.get(i)
            if (stack.item.id == "tiny:air") continue
            if (!stack.item.texture) continue

            let cx = 22/2 * scale - itemSize/2 + i * 20 * scale
            let cy = 22/2 * scale - itemSize/2

            ctx.save()
            ctx.translate(cx, cy)
            ctx.scale(itemSize, itemSize)
            stack.item.texture.draw(ctx)
            ctx.restore()
        }

        // selected slot
        ctx.save()
        ctx.scale(scale, scale)
        ctx.translate(-1, -1)
        ctx.translate(player.selectedItemSlot * 20, 0)
        ctx.scale(24, 24)
        selector.draw(ctx)
        ctx.restore()
    
        ctx.restore()
    }

}