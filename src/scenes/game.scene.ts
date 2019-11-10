
import {
  // IBody,
  // ICursorKeys,
  // IRectangle,
  ISettingsConfig,
  Scene,
} from '../lib';

const sceneConfig: ISettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Scene {

  constructor() {
    super(sceneConfig);
  }

  create() {
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
   // game update loop
  }
}
