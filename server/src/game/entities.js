import { WORLD, PLAYER } from "../../../shared/constants.js";

function rand(min, max) { return Math.random() * (max - min) + min; }

export function createInitialState() {
    return {
        players: new Map(),   // id -> player
        bullets: new Map(),   // id -> bullet
        pickups: new Map(),   // id -> pickup
        nextBulletId: 1,
        nextPickupId: 1,
        lastFire: new Map()   // playerId -> ms
    };
}

export function addPlayer(state, id) {
    state.players.set(id, {
        id,
        x: rand(200, WORLD.W - 200),
        y: rand(200, WORLD.H - 200),
        vx: 0,
        vy: 0,
        fx: 1,
        fy: 0,
        hp: PLAYER.MAX_HP,
        score: 0,
        input: { mx: 0, my: 0, fire: false }
    });
}

export function removePlayer(state, id) {
    state.players.delete(id);
    state.lastFire.delete(id);
}

export function spawnPickup(state, kind = "hp") {
    const id = String(state.nextPickupId++);
    state.pickups.set(id, {
        id,
        kind,
        x: rand(80, WORLD.W - 80),
        y: rand(80, WORLD.H - 80)
    });
    return id;
}
