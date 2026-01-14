export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.image("player", "assets/player.png");
    }

    create() {
        this.scene.start("Menu");
    }
}
