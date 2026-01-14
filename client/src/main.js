import BootScene from "./scenes/BootScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import HudScene from "./scenes/HudScene.js";

const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#0b1020",
    scene: [BootScene, PreloadScene, MenuScene, GameScene, HudScene],
};

new Phaser.Game(config);
