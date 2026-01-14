import { PLAYER, WORLD } from "/shared/constants.js";
import { MAP_WALLS } from "/shared/map.js";

export default class HudScene extends Phaser.Scene {
    constructor() {
        super("HUD");
    }

    create() {
        // Fixed overlay
        this.cameras.main.setScroll(0, 0);

        this.pad = 14;

        // Top-left panel
        this.panel = this.add
            .rectangle(this.pad - 8, this.pad - 8, 270, 110, 0x000000, 0.35)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(20000);

        this.titleText = this.add
            .text(this.pad, this.pad, "Fog of War Arena", {
                fontFamily: "system-ui",
                fontSize: "16px",
                color: "#ffffff",
            })
            .setScrollFactor(0)
            .setDepth(20001);

        this.netText = this.add
            .text(this.pad, this.pad + 24, "Connecting...", {
                fontFamily: "system-ui",
                fontSize: "12px",
                color: "#b9c4ff",
            })
            .setScrollFactor(0)
            .setDepth(20001);

        this.hpText = this.add
            .text(this.pad, this.pad + 42, "HP: -", {
                fontFamily: "system-ui",
                fontSize: "12px",
                color: "#ffffff",
            })
            .setScrollFactor(0)
            .setDepth(20001);

        this.scoreText = this.add
            .text(this.pad, this.pad + 60, "Score: 0", {
                fontFamily: "system-ui",
                fontSize: "12px",
                color: "#ffffff",
            })
            .setScrollFactor(0)
            .setDepth(20001);

        // HP bar
        this.hpBarX = this.pad;
        this.hpBarY = this.pad + 82;
        this.hpBarW = 220;
        this.hpBarH = 10;

        this.hpBarBg = this.add.graphics().setScrollFactor(0).setDepth(20001);
        this.hpBarFg = this.add.graphics().setScrollFactor(0).setDepth(20002);

        // Mini-map (top-right)
        this.miniW = 220;
        this.miniH = 150;
        this.miniX = this.scale.width - this.pad - this.miniW;
        this.miniY = this.pad;

        this.miniBg = this.add
            .rectangle(this.miniX - 6, this.miniY - 6, this.miniW + 12, this.miniH + 12, 0x000000, 0.35)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(20000);

        this.miniStatic = this.add.graphics().setScrollFactor(0).setDepth(20001);
        this.miniDyn = this.add.graphics().setScrollFactor(0).setDepth(20002);

        this.drawMiniStatic();

        // react to resize
        this.scale.on("resize", () => {
            this.miniX = this.scale.width - this.pad - this.miniW;
            this.miniY = this.pad;
            this.miniBg.setPosition(this.miniX - 6, this.miniY - 6);
            this.drawMiniStatic();
        });

        // update every frame
        this.events.on("update", () => this.refresh());
    }

    drawMiniStatic() {
        const g = this.miniStatic;
        g.clear();

        // background
        g.fillStyle(0x0b1020, 1);
        g.fillRect(this.miniX, this.miniY, this.miniW, this.miniH);

        // border
        g.lineStyle(2, 0x445aa3, 0.6);
        g.strokeRect(this.miniX, this.miniY, this.miniW, this.miniH);

        const sx = this.miniW / WORLD.W;
        const sy = this.miniH / WORLD.H;

        // walls
        g.fillStyle(0x2b355a, 1);
        for (const w of MAP_WALLS) {
            g.fillRect(this.miniX + w.x * sx, this.miniY + w.y * sy, w.w * sx, w.h * sy);
        }
    }

    refresh() {
        const me = this.registry.get("me");
        const netStatus = this.registry.get("netStatus");
        const roomId = this.registry.get("roomId");
        const players = this.registry.get("players") || [];

        if (netStatus) this.netText.setText(netStatus + (roomId ? ` | ${roomId}` : ""));

        if (me) {
            const hp = Math.max(0, Math.min(PLAYER.MAX_HP, me.hp ?? PLAYER.MAX_HP));
            const score = me.score ?? 0;

            this.hpText.setText(`HP: ${hp}`);
            this.scoreText.setText(`Score: ${score}`);

            // HP bar draw
            this.hpBarBg.clear();
            this.hpBarBg.fillStyle(0x111a33, 0.9);
            this.hpBarBg.fillRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH);

            this.hpBarFg.clear();
            const frac = hp / PLAYER.MAX_HP;
            this.hpBarFg.fillStyle(0x66ff88, 0.95);
            this.hpBarFg.fillRect(this.hpBarX, this.hpBarY, this.hpBarW * frac, this.hpBarH);

            this.hpBarBg.lineStyle(1, 0x445aa3, 0.7);
            this.hpBarBg.strokeRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH);
        }

        // Mini-map dynamic layer (players)
        const g = this.miniDyn;
        g.clear();

        const sx = this.miniW / WORLD.W;
        const sy = this.miniH / WORLD.H;

        // players that client knows about (fog-of-war)
        for (const p of players) {
            const x = this.miniX + p.x * sx;
            const y = this.miniY + p.y * sy;

            const isMe = me && p.id === me.id;

            g.fillStyle(isMe ? 0xffffff : 0xffcc66, 1);
            g.fillCircle(x, y, isMe ? 4 : 3);
        }
    }
}
