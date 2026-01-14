import { PLAYER, BULLET, PICKUP } from "./constants.js";

export function makePlayerSprite(scene, id, isMe) {
    const body = scene.add.circle(0, 0, PLAYER.R, isMe ? 0xffffff : 0xffcc66);
    const nameText = scene.add.text(0, -34, isMe ? "YOU" : `P${id}`, {
        fontFamily: "system-ui",
        fontSize: "12px",
        color: "#ffffff"
    }).setOrigin(0.5);

    const dirLine = scene.add.graphics();

    return { body, nameText, dirLine };
}

export function updatePlayerSprite(sprite, p, isMe) {
    sprite.body.x = p.x;
    sprite.body.y = p.y;

    sprite.nameText.x = p.x;
    sprite.nameText.y = p.y - 34;

    // HP tint (simple)
    if (isMe) {
        sprite.body.setFillStyle(0xffffff);
    } else {
        sprite.body.setFillStyle((p.hp ?? 100) < 40 ? 0xff6677 : 0xffcc66);
    }

    // Facing line (uses facing vector from snapshot)
    const fx = p.fx ?? 1;
    const fy = p.fy ?? 0;

    sprite.dirLine.clear();
    sprite.dirLine.lineStyle(2, 0xffffff, isMe ? 0.75 : 0.4);
    sprite.dirLine.lineBetween(p.x, p.y, p.x + fx * 28, p.y + fy * 28);
}

export function destroyPlayerSprite(sprite) {
    sprite.body.destroy();
    sprite.nameText.destroy();
    sprite.dirLine.destroy();
}

export function makeBulletSprite(scene) {
    return scene.add.circle(0, 0, BULLET.R, 0x88ddff);
}

export function makePickupSprite(scene) {
    return scene.add.circle(0, 0, PICKUP.R, 0x66ff88);
}
