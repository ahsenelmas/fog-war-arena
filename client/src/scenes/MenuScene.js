export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2 - 80, "Fog of War Arena", {
            fontFamily: "system-ui",
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const btn = this.add.rectangle(width / 2, height / 2 + 20, 280, 70, 0x2b355a, 1)
            .setStrokeStyle(2, 0x445aa3, 1)
            .setInteractive({ useHandCursor: true });

        this.add.text(width / 2, height / 2 + 20, "PLAY", {
            fontFamily: "system-ui",
            fontSize: "26px",
            color: "#ffffff"
        }).setOrigin(0.5);

        btn.on("pointerdown", () => {
            this.scene.start("Game");
            this.scene.launch("Hud");
        });
    }
}
