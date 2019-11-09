import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

  constructor() {
    super(sceneConfig);
    this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
  }

  public create() {
    this.physics.add.existing(this.square);
  }

  public update() {
    const cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys =
      this.input.keyboard.createCursorKeys();

    if (cursorKeys?.up?.isDown) {
      this.square.body.setVelocityY(-500);
    } else if (cursorKeys?.down?.isDown) {
      this.square.body.setVelocityY(500);
    } else {
      this.square.body.setVelocityY(0);
    }

    if (cursorKeys?.right?.isDown) {
      this.square.body.setVelocityX(500);
    } else if (cursorKeys?.left?.isDown) {
      this.square.body.setVelocityX(-500);
    } else {
      this.square.body.setVelocityX(0);
    }
  }
}

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

  scene: GameScene,

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);
