import * as Phaser from 'phaser';
import { BootScene, ControlsScene, GameScene, MainMenuScene } from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Zombie Survival',

  type: Phaser.AUTO,

  width: window.innerWidth,
  height: window.innerHeight,

  physics: {
    default: 'matter',
    matter: {
      debug: true,
    },
  },

  scene: [BootScene, ControlsScene, MainMenuScene, GameScene],

  parent: 'content',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);
