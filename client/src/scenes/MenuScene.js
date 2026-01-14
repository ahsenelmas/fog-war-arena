export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        const bg = this.add.graphics();
        bg.fillStyle(0x111318, 1); // koyu modern mavi
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-100);


        // =========================
        // CENTER CARD (glass)
        // =========================
        const cardW = Math.min(680, width * 0.82);
        const cardH = Math.min(470, height * 0.72);
        const cardX = cx - cardW / 2;
        const cardY = cy - cardH / 2;

        // Card glow behind
        const cardGlow = this.add.graphics();
        cardGlow.fillStyle(0x4f7dff, 0.10);
        cardGlow.fillCircle(cx, cy, Math.max(cardW, cardH) * 0.55);
        cardGlow.setDepth(-5);

        // Shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.45);
        shadow.fillRoundedRect(cardX + 14, cardY + 18, cardW, cardH, 30);

        // Glass
        const card = this.add.graphics();
        card.fillStyle(0x0a1227, 0.86);
        card.fillRoundedRect(cardX, cardY, cardW, cardH, 30);

        // Border (neon subtle)
        card.lineStyle(2, 0x8aa2ff, 0.30);
        card.strokeRoundedRect(cardX, cardY, cardW, cardH, 30);

        // Top highlight
        const topLine = this.add.graphics();
        topLine.lineStyle(2, 0xffffff, 0.06);
        topLine.beginPath();
        topLine.moveTo(cardX + 26, cardY + 22);
        topLine.lineTo(cardX + cardW - 26, cardY + 22);
        topLine.strokePath();

        // =========================
        // TITLE (glow + float)
        // =========================
        const titleShadow = this.add.text(cx, cardY + 84, "Fog of War Arena", {
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontSize: "52px",
            color: "#4f7dff"
        }).setOrigin(0.5).setAlpha(0.20);

        const title = this.add.text(cx, cardY + 80, "Fog of War Arena", {
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontSize: "52px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const subtitle = this.add.text(cx, cardY + 126, "Multiplayer • Fog • Strategy", {
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontSize: "16px",
            color: "#b9c6ff"
        }).setOrigin(0.5).setAlpha(0.9);

        this.tweens.add({
            targets: [title, titleShadow, subtitle],
            y: "-=8",
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        // =========================
        // PLAY BUTTON (neon)
        // =========================
        const btnY = cardY + 220;
        const btnW = Math.min(340, cardW * 0.58);
        const btnH = 62;

        const btnGlow = this.add.graphics();
        btnGlow.fillStyle(0x00d4ff, 0.18);
        btnGlow.fillRoundedRect(cx - btnW / 2 - 14, btnY - btnH / 2 - 14, btnW + 28, btnH + 28, 20);

        const btn = this.add.rectangle(cx, btnY, btnW, btnH, 0x1b2b6b, 1)
            .setStrokeStyle(2, 0x8aa2ff, 0.75)
            .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(cx, btnY, "PLAY", {
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontSize: "22px",
            color: "#ffffff",
            letterSpacing: 2
        }).setOrigin(0.5);

        // Subtle pulse
        this.tweens.add({
            targets: btnGlow,
            alpha: { from: 0.12, to: 0.26 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        btn.on("pointerover", () => {
            btn.setFillStyle(0x243aa0, 1);
            btn.setStrokeStyle(2, 0xb6c4ff, 0.95);
            this.tweens.add({ targets: [btn, btnText], scaleX: 1.04, scaleY: 1.04, duration: 140, ease: "Quad.out" });
        });

        btn.on("pointerout", () => {
            btn.setFillStyle(0x1b2b6b, 1);
            btn.setStrokeStyle(2, 0x8aa2ff, 0.75);
            this.tweens.add({ targets: [btn, btnText], scaleX: 1, scaleY: 1, duration: 170, ease: "Quad.out" });
        });

        btn.on("pointerdown", () => {
            this.tweens.add({ targets: [btn, btnText], scaleX: 0.98, scaleY: 0.98, duration: 80, yoyo: true, ease: "Quad.out" });
            this.cameras.main.fadeOut(260, 0, 0, 0);
            this.time.delayedCall(260, () => {
                this.scene.start("Game");
                this.scene.launch("Hud");
            });
        });

        // =========================
        // CONTROLS (only Move + Shoot, colorful)
        // =========================
        const panelW = Math.min(560, cardW - 90);
        const panelH = 150;
        const panelX = cx - panelW / 2;
        const panelY = cardY + 285;

        const pShadow = this.add.graphics();
        pShadow.fillStyle(0x000000, 0.30);
        pShadow.fillRoundedRect(panelX + 8, panelY + 10, panelW, panelH, 18);

        const panel = this.add.graphics();
        panel.fillStyle(0x0c1633, 0.55);
        panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
        panel.lineStyle(1.5, 0x8aa2ff, 0.18);
        panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);

        this.add.text(cx, panelY + 20, "CONTROLS", {
            fontFamily: "system-ui",
            fontSize: "13px",
            color: "#9fb2ff",
            letterSpacing: 2
        }).setOrigin(0.5);

        // Accent bars (wow)
        const bar = this.add.graphics();
        bar.fillStyle(0x00d4ff, 0.18);
        bar.fillRoundedRect(panelX + 18, panelY + 38, panelW - 36, 4, 3);
        bar.fillStyle(0xff4fd8, 0.10);
        bar.fillRoundedRect(panelX + 18, panelY + 42, panelW - 36, 3, 3);

        const chip = (y, color) => {
            const g = this.add.graphics();
            g.fillStyle(color, 0.10);
            g.fillRoundedRect(panelX + 18, y - 18, panelW - 36, 36, 14);
            g.lineStyle(1, color, 0.18);
            g.strokeRoundedRect(panelX + 18, y - 18, panelW - 36, 36, 14);
            return g;
        };

        const labelStyle = { fontFamily: "system-ui", fontSize: "16px", color: "#e6ecff" };

        const keycap = (x, y, label, accentColor) => {
            const g = this.add.graphics();
            g.fillStyle(0x111d43, 1);
            g.fillRoundedRect(x - 18, y - 14, 36, 28, 10);
            g.lineStyle(1.6, accentColor, 0.55);
            g.strokeRoundedRect(x - 18, y - 14, 36, 28, 10);
            this.add.text(x, y, label, { fontFamily: "system-ui", fontSize: "14px", color: "#ffffff" }).setOrigin(0.5);
            return g;
        };

        const row1Y = panelY + 78;
        const row2Y = panelY + 118;

        chip(row1Y, 0x00d4ff);
        chip(row2Y, 0xff4fd8);

        this.add.text(panelX + 34, row1Y, "⌨  Move", labelStyle).setOrigin(0, 0.5);
        this.add.text(panelX + 34, row2Y, "🔫  Shoot", labelStyle).setOrigin(0, 0.5);

        const rightX = panelX + panelW * 0.62;

        // WASD (cyan)
        keycap(rightX + 0, row1Y, "W", 0x00d4ff);
        keycap(rightX + 42, row1Y, "A", 0x00d4ff);
        keycap(rightX + 84, row1Y, "S", 0x00d4ff);
        keycap(rightX + 126, row1Y, "D", 0x00d4ff);

        // K (pink)
        keycap(rightX + 20, row2Y, "K", 0xff4fd8);
        this.add.text(rightX + 58, row2Y, "Hold to fire", {
            fontFamily: "system-ui",
            fontSize: "14px",
            color: "#ffd1f3"
        }).setOrigin(0, 0.5).setAlpha(0.85);

        // =========================
        // Footer (minimal)
        // =========================
        this.add.text(cx, cardY + cardH - 18, "Press PLAY to enter the arena", {
            fontFamily: "system-ui",
            fontSize: "13px",
            color: "#7f93ff"
        }).setOrigin(0.5).setAlpha(0.75);
    }

    // ---------- Background helpers ----------
    _drawBaseGradient(width, height) {
        const g = this.add.graphics();
        g.fillStyle(0x040611, 1);
        g.fillRect(0, 0, width, height);

        // soft bands
        const band = this.add.graphics();
        for (let i = 0; i < 10; i++) {
            const a = 0.05 + i * 0.012;
            band.fillStyle(0x142866, a);
            band.fillRoundedRect(-width * 0.35 + i * 110, -height * 0.2, width * 0.95, height * 1.5, 260);
        }

        // vignette
        const v = this.add.graphics();
        v.fillStyle(0x000000, 0.35);
        v.fillRect(0, 0, width, 80);
        v.fillRect(0, height - 80, width, 80);
        v.fillRect(0, 0, 80, height);
        v.fillRect(width - 80, 0, 80, height);
    }

    _createStars(width, height) {
        const group = this.add.group();
        const count = Math.min(90, Math.floor((width * height) / 22000));

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const r = Phaser.Math.Between(1, 2);

            const star = this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.04, 0.12));
            group.add(star);

            this.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: star.alpha + 0.08 },
                duration: Phaser.Math.Between(1200, 2600),
                yoyo: true,
                repeat: -1,
                ease: "Sine.inOut"
            });

            this.tweens.add({
                targets: star,
                x: x + Phaser.Math.Between(-40, 40),
                y: y + Phaser.Math.Between(-25, 25),
                duration: Phaser.Math.Between(8000, 14000),
                yoyo: true,
                repeat: -1,
                ease: "Sine.inOut"
            });
        }
        return group;
    }

    _createNeonBlobs(width, height) {
        // 2 moving soft circles (neon blobs)
        const g1 = this.add.circle(width * 0.25, height * 0.35, 220, 0x00d4ff, 0.08);
        const g2 = this.add.circle(width * 0.75, height * 0.65, 260, 0xff4fd8, 0.06);

        this.tweens.add({
            targets: g1,
            x: width * 0.35,
            y: height * 0.45,
            duration: 9000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        this.tweens.add({
            targets: g2,
            x: width * 0.65,
            y: height * 0.55,
            duration: 11000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        const group = this.add.group([g1, g2]);
        return group;
    }
}
