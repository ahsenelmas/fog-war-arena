import { spawnPickup } from "./entities.js";
import { stepPlayers, stepBullets } from "./physics.js";
import { tryFire, stepCombat, stepPickups } from "./combat.js";

export function tickWorld(state, dt) {
    // 1) move players
    stepPlayers(state, dt);

    // 2) fire bullets (server-authoritative)
    for (const p of state.players.values()) {
        if (p.input.fire) tryFire(state, p);
    }

    // 3) move bullets
    stepBullets(state, dt);

    // 4) resolve hits + expirations
    stepCombat(state);

    // 5) pickup collection & respawn pickup if needed
    const collected = stepPickups(state);
    if (collected) spawnPickup(state, "hp");
}
