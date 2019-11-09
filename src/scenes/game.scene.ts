
import { IBody, ICursorKeys, IRectangle, ISettingsConfig, Scene } from '../lib';

const sceneConfig: ISettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Scene {
  private square: IRectangle & { body: IBody };

  constructor() {
    super(sceneConfig);
  }

  preload() {
    this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
  }

  create() {
    this.physics.add.existing(this.square);
  }

  update() {
    const cursorKeys: ICursorKeys = this.input.keyboard.createCursorKeys();

    // TODO: figure out why tslint doesn't like optional chaining
    if (cursorKeys && cursorKeys.up && cursorKeys.up.isDown) {
      this.square.body.setVelocityY(-500);
    } else if (cursorKeys && cursorKeys.down && cursorKeys.down.isDown) {
      this.square.body.setVelocityY(500);
    } else {
      this.square.body.setVelocityY(0);
    }

    if (cursorKeys && cursorKeys.right && cursorKeys.right.isDown) {
      this.square.body.setVelocityX(500);
    } else if (cursorKeys && cursorKeys.left && cursorKeys.left.isDown) {
      this.square.body.setVelocityX(-500);
    } else {
      this.square.body.setVelocityX(0);
    }
  }
}
