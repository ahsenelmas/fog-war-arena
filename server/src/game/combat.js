import { BULLET, PLAYER } from "../../../shared/constants.js";
import { clamp } from "./util.js";

export function applyDamage(state, victimId, dmg, attackerId) {
    const v = state.players.get(victimId);
    if (!v) return;

    v.hp = clamp((v.hp ?? PLAYER.HP) - dmg, 0, PLAYER.HP);
    if (v.hp <= 0) {
        // attacker score
        const a = state.players.get(attackerId);
        if (a) a.score = (a.score ?? 0) + 1;

        // respawn
        v.hp = PLAYER.HP;
        v.x = 150 + Math.random() * 2000;
        v.y = 150 + Math.random() * 1200;
        v.vx = 0; v.vy = 0;
    }
}

export function tryFire(state, t, p) {
    if (!p) return;
    if (!p.fire) return;

    const nextAt = p.nextFireAt ?? 0;
    if (t < nextAt) return;
    p.nextFireAt = t + BULLET.FIRE_COOLDOWN_MS;

    const dirx = p.fx ?? 1;
    const diry = p.fy ?? 0;

    const id = state.nextBulletId++;
    state.bullets.set(id, {
        id,
        owner: p.id,
        x: p.x + dirx * (PLAYER.R + 4),
        y: p.y + diry * (PLAYER.R + 4),
        vx: dirx * BULLET.SPEED,
        vy: diry * BULLET.SPEED,
        bouncesLeft: BULLET.BOUNCES,
        dieAt: t + BULLET.LIFE_MS
    });
}
