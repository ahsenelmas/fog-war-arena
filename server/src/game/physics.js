import { BULLET, PLAYER } from "../../../shared/constants.js";
import { MAP_WALLS } from "../../../shared/map.js";
import { applyDamage } from "./combat.js";

function circleVsRect(cx, cy, r, rx, ry, rw, rh) {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return { hit: (dx * dx + dy * dy) < (r * r), nearestX, nearestY, dx, dy };
}

function bounceOffRect(b, r, w) {
    // if circle center is inside the rect or exactly on edge, dx/dy may be 0
    // decide bounce axis by minimal penetration to sides
    const leftPen = Math.abs(b.x - w.x);
    const rightPen = Math.abs((w.x + w.w) - b.x);
    const topPen = Math.abs(b.y - w.y);
    const bottomPen = Math.abs((w.y + w.h) - b.y);

    const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

    if (minPen === leftPen) {
        b.x = w.x - r - 0.01;
        b.vx = -Math.abs(b.vx);
    } else if (minPen === rightPen) {
        b.x = w.x + w.w + r + 0.01;
        b.vx = Math.abs(b.vx);
    } else if (minPen === topPen) {
        b.y = w.y - r - 0.01;
        b.vy = -Math.abs(b.vy);
    } else {
        b.y = w.y + w.h + r + 0.01;
        b.vy = Math.abs(b.vy);
    }
}

export function stepPlayers(state, dt) {
    for (const p of state.players.values()) {
        // integrate velocity
        p.x += (p.vx ?? 0) * dt;
        p.y += (p.vy ?? 0) * dt;

        // keep in world bounds (simple)
        p.x = Math.max(PLAYER.R, Math.min(state.world.w - PLAYER.R, p.x));
        p.y = Math.max(PLAYER.R, Math.min(state.world.h - PLAYER.R, p.y));

        // stop on walls (circle vs rect)
        for (const w of MAP_WALLS) {
            const col = circleVsRect(p.x, p.y, PLAYER.R, w.x, w.y, w.w, w.h);
            if (!col.hit) continue;

            // push out: choose axis by penetration
            const leftPen = Math.abs(p.x - w.x);
            const rightPen = Math.abs((w.x + w.w) - p.x);
            const topPen = Math.abs(p.y - w.y);
            const bottomPen = Math.abs((w.y + w.h) - p.y);

            const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

            if (minPen === leftPen) { p.x = w.x - PLAYER.R - 0.01; p.vx = 0; }
            else if (minPen === rightPen) { p.x = w.x + w.w + PLAYER.R + 0.01; p.vx = 0; }
            else if (minPen === topPen) { p.y = w.y - PLAYER.R - 0.01; p.vy = 0; }
            else { p.y = w.y + w.h + PLAYER.R + 0.01; p.vy = 0; }
        }
    }
}

export function stepBullets(state, dt) {
    const r = BULLET?.R ?? 4;

    for (const [id, b] of state.bullets.entries()) {
        // life
        if (state.now >= b.dieAt) {
            state.bullets.delete(id);
            continue;
        }

        // integrate
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // wall collision => bounce
        let bounced = false;
        for (const w of MAP_WALLS) {
            const col = circleVsRect(b.x, b.y, r, w.x, w.y, w.w, w.h);
            if (!col.hit) continue;

            bounced = true;

            // decrement
            b.bouncesLeft = (b.bouncesLeft ?? 0) - 1;
            if (b.bouncesLeft < 0) {
                state.bullets.delete(id);
                break;
            }

            // reflect
            bounceOffRect(b, r, w);
            break; // only 1 wall per tick
        }
        if (!state.bullets.has(id)) continue;

        // hit players (no friendly fire)
        for (const [pid, p] of state.players.entries()) {
            if (pid === b.owner) continue;

            const dx = p.x - b.x;
            const dy = p.y - b.y;
            const rr = (PLAYER.R + r);
            if (dx * dx + dy * dy <= rr * rr) {
                applyDamage(state, pid, BULLET.DAMAGE, b.owner);
                state.bullets.delete(id);
                break;
            }
        }
    }
}
