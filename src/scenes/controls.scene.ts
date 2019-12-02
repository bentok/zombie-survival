import { getGameHeight, getGameWidth } from '../helpers';
import { Scene } from '../lib/scene.class';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Controls',
};

export class ControlsScene extends Scene {
  public speed: number = 200;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private image: Phaser.Physics.Matter.Sprite;

  constructor() {
    super(sceneConfig);
  }

  create() {
    this.image = this.matter.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'block');
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.add.tileSprite(0, window.innerHeight, window.innerWidth, 256, 'ground').setOrigin(0, 1);
    this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);
    const path = `0 ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight} 0 ${window.innerHeight}`;
    const verts = (this.matter as any).verts.fromPath(path);

    this.matter.add.fromVertices(408, 492, verts, { ignoreGravity: true }, true, 0.01, 10);

    const zombie = this.matter.add
      .image(Phaser.Math.Between(32, 768), -200, 'zombie', Phaser.Math.Between(0, 5));

    // zombie.setCircle();
    zombie.setBounce(0.96);
  }

  update() {

    if (this?.cursorKeys?.left?.isDown) {
      this.image.setVelocityX(-10);
    } else if (this?.cursorKeys?.right?.isDown) {
      this.image.setVelocityX(10);
    } else {
      this.image.setVelocityX(0);
    }
    if (this?.cursorKeys?.up?.isDown) {
      this.image.setVelocityY(-10);
    } else if (this?.cursorKeys?.down?.isDown) {
      this.image.setVelocityY(10);
    } else {
      this.image.setVelocityY(0);
    }
  }
}
