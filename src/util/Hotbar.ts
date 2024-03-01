import Graphics from "../Graphics.js"
import { player } from "../gui/state/ingame.js";
import { game, getTexture } from "../main.js";
import Subtexture from "../texture/Subtexture.js";
import Texture from "../texture/Texture.js";

let widgets: Texture
let leftSlot: Subtexture
let middleSlot: Subtexture
let rightSlot: Subtexture
let selector: Subtexture

const scale = 4
const itemSize = scale * 12

export default class Hotbar {

    static loadTexture() {
        widgets = getTexture("tiny/textures/gui/widgets.png")
        leftSlot = widgets.getSubtexture(0, 0, 21, 22)
        middleSlot = widgets.getSubtexture(21, 0, 20, 22)
        rightSlot = widgets.getSubtexture(161, 0, 21, 22)
        selector = widgets.getSubtexture(0, 22, 24, 24)
    }

    static drawHotbar(g: Graphics) {
		const ctx = g.ctx
        let hotbar = player.hotbar

        ctx.save()
        ctx.translate(-204, game.height/2 - 100)

        ctx.save()
        ctx.scale(scale, scale)

        // first and last are diff b/c black outline
        ctx.save()
        ctx.scale(21, 22)
        leftSlot.draw(g, 1, 1, true)
        ctx.restore()
        
        ctx.save()
        ctx.translate(21, 0)
        ctx.scale(20, 22)
        for (let i = 1; i < hotbar.size -1; i++) {
            middleSlot.draw(g, 1, 1, true)
            ctx.translate(1, 0)
        }
        ctx.restore()

        ctx.save()
        ctx.translate(21 + (hotbar.size-2) * 20, 0)
        ctx.scale(21, 22)
        rightSlot.draw(g, 1, 1, true)
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
            stack.draw(g, itemSize)
            ctx.restore()
        }

        // selected slot
        ctx.save()
        ctx.scale(scale, scale)
        ctx.translate(-1, -1)
        ctx.translate(player.selectedItemSlot * 20, 0)
        ctx.scale(24, 24)
        selector.draw(g, 1, 1, true)
        ctx.restore()
    
        ctx.restore()
    }

}
