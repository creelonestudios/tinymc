import Graphics from "./Graphics.js"
import { game, getTexture, player } from "./main.js";
import Subtexture from "./texture/subtexture.js";
import Texture from "./texture/texture.js";

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

    static drawHotbar(g: Graphics) {
        let hotbar = player.hotbar

        g.save()
        g.translate(-204, game.height/2 - 100, true)

        g.save()
        g.scale(scale, scale)

        // first and last are diff b/c black outline
        g.save()
        g.scale(21, 22)
        leftSlot.draw(g)
        g.restore()
        
        g.save()
        g.translate(21, 0)
        g.scale(20, 22)
        for (let i = 1; i < hotbar.size -1; i++) {
            middleSlot.draw(g)
            g.translate(1, 0)
        }
        g.restore()

        g.save()
        g.translate(21 + (hotbar.size-2) * 20, 0)
        g.scale(21, 22)
        rightSlot.draw(g)
        g.restore()

        g.restore()

        for (let i = 0; i < hotbar.size; i++) {
            let stack = hotbar.get(i)
            if (stack.item.id == "tiny:air") continue
            if (!stack.item.texture) continue

            let cx = 22/2 * scale - itemSize/2 + i * 20 * scale
            let cy = 22/2 * scale - itemSize/2

            g.save()
            g.translate(cx, cy, true)
            g.scale(itemSize, itemSize)
            stack.item.texture.draw(g)
            g.restore()
        }

        // selected slot
        g.save()
        g.scale(scale, scale)
        g.translate(-1, -1, true)
        g.translate(player.selectedItemSlot * 20, 0)
        g.scale(24, 24)
        selector.draw(g)
        g.restore()
    
        g.restore()
    }

}
