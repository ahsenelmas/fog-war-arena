import { WORLD, PLAYER, BULLET, PICKUP } from "../../../shared/constants.js";
import { MAP_WALLS } from "../../../shared/map.js";

function nowMs() { return Date.now(); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ✅ fallbacks (constants dosyanda eksik export varsa hit/damage bozulmasın diye)
const BULLET_R = Number(BULLET?.R ?? 4);
const BULLET_SPEED = Number(BULLET?.SPEED ?? 800);
const BULLET_DMG = Number(BULLET?.DAMAGE ?? 10);
const BULLET_LIFE_MS = Number(BULLET?.LIFE_MS ?? 1200);
const BULLET_CD_MS = Number(BULLET?.FIRE_COOLDOWN_MS ?? 180);

const PICKUP_R = Number(PICKUP?.R ?? 14);
const PICKUP_HEAL = Number(PICKUP?.HEALTH_AMOUNT ?? 25);

// ricochet tuning
const MAX_BOUNCES = 2;
const BOUNCE_LOSS = 0.88; // her sekmede hız * 0.88

function circleVsRect(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    const d2 = dx * dx + dy * dy;
    if (d2 > cr * cr) return null;

    // normalı yaklaşık belirle (hangi eksenden daha çok sıkıştı)
    // dx,dy sıfıra yakınsa (köşe üstünde) en yakın ekseni seç
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    let nx = 0, ny = 0;
    if (adx > ady) nx = dx >= 0 ? 1 : -1;
    else ny = dy >= 0 ? 1 : -1;

    // overlap (yaklaşık)
    const dist = Math.sqrt(Math.max(d2, 0.000001));
    const overlap = cr - dist;

    return { nx, ny, overlap };
}

export class World {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = new Map();
        this.bullets = new Map();
        this.pickups = new Map();
        this.nextBulletId = 1;
        this.nextPickupId = 1;
        this.lastFire = new Map();

        for (let i = 0; i < 12; i++) this.spawnPickup();
    }

    getWorldInfo() { return { w: WORLD.W, h: WORLD.H }; }

    addPlayer(id) {
        this.players.set(id, {
            id,
            x: rand(200, WORLD.W - 200),
            y: rand(200, WORLD.H - 200),
            vx: 0, vy: 0,
            fx: 1, fy: 0,
            hp: PLAYER.MAX_HP,
            score: 0,
            input: { mx: 0, my: 0, fire: false }
        });
    }

    removePlayer(id) {
        this.players.delete(id);
        this.lastFire.delete(id);
    }

    applyInput(id, msg) {
        const p = this.players.get(id);
        if (!p) return;

        const mx0 = Number(msg.move?.x ?? 0);
        const my0 = Number(msg.move?.y ?? 0);
        const fire = !!msg.fire;

        const len = Math.hypot(mx0, my0);
        let mx = 0, my = 0;
        if (len > 0.0001) { mx = mx0 / len; my = my0 / len; }

        p.input.mx = clamp(mx, -1, 1);
        p.input.my = clamp(my, -1, 1);
        p.input.fire = fire;

        // facing: sadece hareket varsa güncelle
        if (Math.abs(p.input.mx) > 0.0001 || Math.abs(p.input.my) > 0.0001) {
            p.fx = p.input.mx;
            p.fy = p.input.my;
        }
    }

    tick(dt) {
        // players movement + wall collision
        for (const p of this.players.values()) {
            p.vx = p.input.mx * PLAYER.SPEED;
            p.vy = p.input.my * PLAYER.SPEED;

            p.x = clamp(p.x + p.vx * dt, PLAYER.R, WORLD.W - PLAYER.R);
            p.y = clamp(p.y + p.vy * dt, PLAYER.R, WORLD.H - PLAYER.R);

            // push out of walls (circle vs rect)
            for (const wall of MAP_WALLS) {
                const nearestX = Math.max(wall.x, Math.min(p.x, wall.x + wall.w));
                const nearestY = Math.max(wall.y, Math.min(p.y, wall.y + wall.h));
                const dx = p.x - nearestX;
                const dy = p.y - nearestY;
                const dist = Math.hypot(dx, dy);
                if (dist < PLAYER.R && dist > 0.0001) {
                    const push = (PLAYER.R - dist);
                    p.x += (dx / dist) * push;
                    p.y += (dy / dist) * push;
                }
            }

            if (p.input.fire) this.tryFire(p);
        }

        // bullets
        const t = nowMs();
        for (const [bid, b] of this.bullets) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (t > b.dieAt) { this.bullets.delete(bid); continue; }
            if (b.x < 0 || b.x > WORLD.W || b.y < 0 || b.y > WORLD.H) { this.bullets.delete(bid); continue; }

            // ✅ wall collision + ricochet
            let bounced = false;
            for (const w of MAP_WALLS) {
                const hit = circleVsRect(b.x, b.y, b.r, w.x, w.y, w.w, w.h);
                if (!hit) continue;

                // push bullet out
                b.x += hit.nx * (hit.overlap + 0.5);
                b.y += hit.ny * (hit.overlap + 0.5);

                // reflect velocity
                if (hit.nx !== 0) b.vx = -b.vx;
                if (hit.ny !== 0) b.vy = -b.vy;

                b.vx *= BOUNCE_LOSS;
                b.vy *= BOUNCE_LOSS;

                b.bounces = (b.bounces ?? 0) + 1;
                bounced = true;

                if (b.bounces > MAX_BOUNCES) {
                    this.bullets.delete(bid);
                }
                break;
            }
            if (!this.bullets.has(bid)) continue;

            // ✅ player hit (burada BULLET.R NaN olmasın diye b.r kullanıyoruz)
            for (const pl of this.players.values()) {
                if (pl.id === b.owner) continue;

                const dx = pl.x - b.x;
                const dy = pl.y - b.y;
                const rr = PLAYER.R + b.r;
                if (dx * dx + dy * dy < rr * rr) {
                    this.damage(pl.id, b.owner, b.dmg);
                    this.bullets.delete(bid);
                    break;
                }
            }
        }

        // pickups
        for (const [pid, pk] of this.pickups) {
            for (const p of this.players.values()) {
                const dx = p.x - pk.x;
                const dy = p.y - pk.y;
                const rr = PLAYER.R + pk.r;
                if (dx * dx + dy * dy < rr * rr) {
                    if (pk.kind === "hp") p.hp = Math.min(PLAYER.MAX_HP, p.hp + pk.amount);
                    this.pickups.delete(pid);
                    this.spawnPickup();
                    break;
                }
            }
        }
    }

    tryFire(p) {
        const t = nowMs();
        const last = this.lastFire.get(p.id) ?? 0;
        if (t - last < BULLET_CD_MS) return;
        this.lastFire.set(p.id, t);

        const len = Math.hypot(p.fx, p.fy) || 1;
        const dx = p.fx / len;
        const dy = p.fy / len;

        const id = String(this.nextBulletId++);
        this.bullets.set(id, {
            id,
            owner: p.id,
            x: p.x + dx * (PLAYER.R + 6),
            y: p.y + dy * (PLAYER.R + 6),
            vx: dx * BULLET_SPEED,
            vy: dy * BULLET_SPEED,
            r: BULLET_R,
            dmg: BULLET_DMG,
            bounces: 0,
            dieAt: t + BULLET_LIFE_MS
        });
    }

    damage(victimId, attackerId, dmg) {
        const v = this.players.get(victimId);
        const a = this.players.get(attackerId);
        if (!v) return;

        v.hp -= dmg;

        if (v.hp <= 0) {
            if (a) a.score += 1;

            // respawn
            v.hp = PLAYER.MAX_HP;
            v.x = rand(200, WORLD.W - 200);
            v.y = rand(200, WORLD.H - 200);
        }
    }

    spawnPickup() {
        const id = String(this.nextPickupId++);
        this.pickups.set(id, {
            id,
            kind: "hp",
            x: rand(80, WORLD.W - 80),
            y: rand(80, WORLD.H - 80),
            r: PICKUP_R,
            amount: PICKUP_HEAL
        });
    }

    makeSnapshotFor(viewerId) {
        const me = this.players.get(viewerId);
        if (!me) return { t: Date.now(), me: null, players: [], bullets: [], pickups: [] };

        const visiblePlayers = [];
        for (const p of this.players.values()) {
            const d = Math.hypot(p.x - me.x, p.y - me.y);
            if (p.id === viewerId || d <= PLAYER.VISION) {
                visiblePlayers.push({ id: p.id, x: p.x, y: p.y, hp: p.hp, score: p.score, fx: p.fx, fy: p.fy });
            }
        }

        const visibleBullets = [];
        for (const b of this.bullets.values()) {
            const d = Math.hypot(b.x - me.x, b.y - me.y);
            if (d <= PLAYER.VISION + 240) visibleBullets.push({ id: b.id, x: b.x, y: b.y });
        }

        const visiblePickups = [];
        for (const pk of this.pickups.values()) {
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
}
