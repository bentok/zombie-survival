import * as Phaser from 'phaser';
import { BootScene, GameScene, MainMenuScene } from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Zombie Survival',

  type: Phaser.AUTO,

  width: window.innerWidth,
  height: window.innerHeight,

  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },

  scene: [BootScene, MainMenuScene, GameScene],

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);
