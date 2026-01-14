import NetClient from "../net/NetClient.js";
import { InterpBuffer } from "../game/interp.js";
import { createFog, updateFog } from "../game/fog.js";
import { getMoveVector } from "../game/input.js";
import { interpEntity } from "../game/render.js";
import { PLAYER, WORLD } from "/shared/constants.js";
import { MSG } from "/shared/protocol.js";
import { MAP_WALLS } from "/shared/map.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
        this.net = new NetClient();
        this.interp = new InterpBuffer();
        this.seq = 0;

        this.worldSize = { w: WORLD.W, h: WORLD.H };
        this.myId = null;
        this.me = null;

        this.entities = {
            players: new Map(),
            bullets: new Map(),
            pickups: new Map()
        };
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ W: "W", A: "A", S: "S", D: "D" });
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, this.worldSize.w, this.worldSize.h);

        this.mapGfx = this.add.graphics();
        this.drawMap();

        this.fog = createFog(this);
        this.explored = [];
        this.exploreTimer = 0;

        this.net.on(MSG.WELCOME, (m) => {
            this.myId = m.id;
            this.registry.set("netStatus", `Connected as ${this.myId}`);
        });

        this.net.on(MSG.ROOM_JOINED, (m) => {
            this.worldSize = { w: m.world.w, h: m.world.h };
            this.cam.setBounds(0, 0, this.worldSize.w, this.worldSize.h);
            this.drawMap();
            this.registry.set("world", m.world);
            this.registry.set("netStatus", `In room ${m.roomId}`);
        });

        this.net.on(MSG.SNAPSHOT, (snap) => {
            this.interp.push(snap);
            this.registry.set("me", snap.me);
            this.registry.set("snapshot", snap);
        });

        this.net.connect();

        this.time.addEvent({
            delay: 150,
            loop: false,
            callback: () => this.net.join("public-1")
        });

        this.time.addEvent({
            delay: 33,
            loop: true,
            callback: () => this.sendInput()
        });
    }

    drawMap() {
        const g = this.mapGfx;
        g.clear();

        g.fillStyle(0x0b1020, 1);
        g.fillRect(0, 0, this.worldSize.w, this.worldSize.h);

        g.fillStyle(0x111a33, 0.4);
        for (let i = 0; i < 2000; i++) {
            g.fillRect(Math.random() * this.worldSize.w, Math.random() * this.worldSize.h, 1, 1);
        }

        g.fillStyle(0x2b355a, 1);
        for (const w of MAP_WALLS) g.fillRect(w.x, w.y, w.w, w.h);

        g.lineStyle(2, 0x445aa3, 0.6);
        for (const w of MAP_WALLS) g.strokeRect(w.x, w.y, w.w, w.h);
    }

    update(_, deltaMs) {
        const dt = deltaMs / 1000;
        this.interp.step(dt);

        const pack = this.interp.get();
        if (!pack) return;

        const { prev, next, alpha } = pack;

        this.me = next.me;
        if (!this.me) return;

        // camera follow
        this.cam.centerOn(this.me.x, this.me.y);

        const prevPlayers = new Map((prev.players || []).map(p => [p.id, p]));
        const nextPlayers = new Map((next.players || []).map(p => [p.id, p]));
        const prevBullets = new Map((prev.bullets || []).map(b => [b.id, b]));
        const nextBullets = new Map((next.bullets || []).map(b => [b.id, b]));

        this.renderPlayers(prevPlayers, nextPlayers, alpha);
        this.renderBullets(prevBullets, nextBullets, alpha);
        this.renderPickups(next.pickups || []);

        // exploration trail for fog
        this.exploreTimer += dt;
        if (this.exploreTimer >= 0.15) {
            this.exploreTimer = 0;
            this.explored.push({ x: this.me.x, y: this.me.y });
            if (this.explored.length > 400) this.explored.shift();
        }

        updateFog(this, this.fog, this.me.x, this.me.y, PLAYER.VISION, this.explored);
    }

    sendInput() {
        if (!this.myId || !this.net.connected) return;

        const move = getMoveVector(this.keys, this.cursors);
        const fire = this.shootKey.isDown;

        this.registry.set("debugMove", `move: ${move.x},${move.y} | K:${fire ? 1 : 0}`);

        this.net.input({ seq: ++this.seq, move, fire });
    }

    renderPlayers(prevMap, nextMap, alpha) {
        const TARGET_PX = 42;

        for (const id of nextMap.keys()) {
            const p = interpEntity(prevMap, nextMap, id, alpha);
            if (!p) continue;

            if (!this.entities.players.has(id)) {
                const body = this.add.sprite(p.x, p.y, "player").setOrigin(0.5);

                const tex = body.texture.getSourceImage();
                const baseScale = TARGET_PX / tex.width;

                if (id !== this.myId) body.setTint(0xffcc66);

                const nameText = this.add.text(
                    p.x, p.y - 30,
                    id === this.myId ? "YOU" : `P${id}`,
                    { fontFamily: "system-ui", fontSize: "12px", color: "#ffffff" }
                ).setOrigin(0.5);

                const hpBar = this.add.graphics();
                const dirLine = this.add.graphics();

                this.entities.players.set(id, {
                    body, nameText, hpBar, dirLine,
                    lastX: p.x, lastY: p.y,
                    walkT: 0,
                    baseScale,
                    lastHp: (p.hp ?? PLAYER.HP)
                });
            }

            const e = this.entities.players.get(id);

            // ✅ HIT EFFECT (HP düştüyse)
            const curHp = (p.hp ?? PLAYER.HP);
            if (curHp < (e.lastHp ?? curHp)) {
                e.body.setTint(0xff4444);

                this.time.delayedCall(90, () => {
                    if (!e.body || !e.body.active) return;
                    if (id !== this.myId) e.body.setTint(0xffcc66);
                    else e.body.clearTint();
                });

                if (id === this.myId) {
                    this.cameras.main.shake(120, 0.008);
                }
            }
            e.lastHp = curHp;

            // movement detect
            const dxm = p.x - e.lastX;
            const dym = p.y - e.lastY;
            const moved = (dxm * dxm + dym * dym) > 0.12;

            if (moved) e.walkT += 0.18;
            else e.walkT = 0;

            const bob = moved ? Math.sin(e.walkT * 8) * 0.06 : 0;
            const sc = 1 + (moved ? Math.sin(e.walkT * 8) * 0.03 : 0);

            // position + bob
            e.body.x = p.x;
            e.body.y = p.y + bob * 6;

            // scale
            e.body.setScale(e.baseScale * sc);

            // facing
            e.body.setFlipX((p.fx ?? 1) < 0);

            // name
            e.nameText.x = p.x;
            e.nameText.y = p.y - 30;

            // HP bar
            const ratio = Phaser.Math.Clamp(curHp / PLAYER.HP, 0, 1);

            const barW = 34;
            const barH = 6;
            const bx = p.x - barW / 2;
            const by = p.y - 22;

            e.hpBar.clear();
            e.hpBar.fillStyle(0x000000, 0.6);
            e.hpBar.fillRoundedRect(bx - 1, by - 1, barW + 2, barH + 2, 3);
            e.hpBar.fillStyle(0x33ff66, 0.95);
            e.hpBar.fillRoundedRect(bx, by, barW * ratio, barH, 3);

            // dir line
            const fx = p.fx ?? 1;
            const fy = p.fy ?? 0;
            e.dirLine.clear();
            e.dirLine.lineStyle(2, 0xffffff, id === this.myId ? 0.7 : 0.4);
            e.dirLine.lineBetween(p.x, p.y, p.x + fx * 22, p.y + fy * 22);

            // store last
            e.lastX = p.x;
            e.lastY = p.y;
        }

        // cleanup
        for (const [id, e] of this.entities.players.entries()) {
            if (!nextMap.has(id)) {
                e.body.destroy();
                e.nameText.destroy();
                e.hpBar.destroy();
                e.dirLine.destroy();
                this.entities.players.delete(id);
            }
        }
    }


    renderBullets(prevMap, nextMap, alpha) {
        for (const id of nextMap.keys()) {
            const b = interpEntity(prevMap, nextMap, id, alpha);
            if (!b) continue;

            if (!this.entities.bullets.has(id)) {
                const circle = this.add.circle(b.x, b.y, 4, 0x88ddff);

                const trail = this.add.graphics();
                // trail üstte kalsın
                trail.setDepth((circle.depth ?? 0) - 1);

                this.entities.bullets.set(id, {
                    circle,
                    trail,
                    lastX: b.x,
                    lastY: b.y
                });
            }

            const obj = this.entities.bullets.get(id);

            // ✅ fade: trail’i hafifçe karart (tam silmez, iz bırakır)
            obj.trail.fillStyle(0x000000, 0.12);
            obj.trail.fillRect(0, 0, this.worldSize.w, this.worldSize.h);

            // trail line
            obj.trail.lineStyle(2, 0x66ccff, 0.55);
            obj.trail.beginPath();
            obj.trail.moveTo(obj.lastX, obj.lastY);
            obj.trail.lineTo(b.x, b.y);
            obj.trail.strokePath();

            obj.lastX = b.x;
            obj.lastY = b.y;

            obj.circle.x = b.x;
            obj.circle.y = b.y;
        }

        for (const [id, obj] of this.entities.bullets.entries()) {
            if (!nextMap.has(id)) {
                obj.circle.destroy();
                obj.trail.destroy();
                this.entities.bullets.delete(id);
            }
        }
    }



    renderPickups(list) {
        const nextIds = new Set(list.map(p => p.id));
        for (const pk of list) {
            if (!this.entities.pickups.has(pk.id)) {
                this.entities.pickups.set(pk.id, this.add.circle(pk.x, pk.y, 12, 0x66ff88));
            } else {
                const c = this.entities.pickups.get(pk.id);
                c.x = pk.x; c.y = pk.y;
            }
        }
        for (const [id, c] of this.entities.pickups.entries()) {
            if (!nextIds.has(id)) { c.destroy(); this.entities.pickups.delete(id); }
        }
    }
}
