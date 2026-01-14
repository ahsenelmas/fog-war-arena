import { PLAYER } from "../../../shared/constants.js";

export function makeSnapshotFor(state, viewerId) {
    const me = state.players.get(viewerId);
    if (!me) return { t: Date.now(), me: null, players: [], bullets: [], pickups: [] };

    const visiblePlayers = [];
    for (const p of state.players.values()) {
        const d = Math.hypot(p.x - me.x, p.y - me.y);
        if (p.id === viewerId || d <= PLAYER.VISION) {
            visiblePlayers.push({
                id: p.id,
                x: p.x,
                y: p.y,
                hp: p.hp,
                score: p.score,
                fx: p.fx,
                fy: p.fy
            });
        }
    }

    const visibleBullets = [];
    for (const b of state.bullets.values()) {
        const d = Math.hypot(b.x - me.x, b.y - me.y);
        if (d <= PLAYER.VISION + 240) visibleBullets.push({ id: b.id, x: b.x, y: b.y });
    }

    const visiblePickups = [];
    for (const pk of state.pickups.values()) {
        const d = Math.hypot(pk.x - me.x, pk.y - me.y);
        if (d <= PLAYER.VISION) visiblePickups.push(pk);
    }

    return {
        t: Date.now(),
        me: { id: me.id, x: me.x, y: me.y, hp: me.hp, score: me.score, fx: me.fx, fy: me.fy },
        players: visiblePlayers,
        bullets: visibleBullets,
        pickups: visiblePickups
    };
}
