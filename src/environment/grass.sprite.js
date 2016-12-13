import { WORLD_WIDTH } from '../states/zone1.config';

/**
 * Sets up the canvas for grass ground layer
 */
class GrassBitmap extends Phaser.BitmapData {
  constructor ({ game = {} } = {}) {
    super(game, 'grass', WORLD_WIDTH, 40);
    this.ctx.fillStyle = '#476A34';
    this.ctx.beginPath();
    this.ctx.rect(0, 20, WORLD_WIDTH, 20);
    this.ctx.fill();
    this.ctx.fillStyle = '#687E5A';
    this.ctx.beginPath();
    this.ctx.rect(0, 0, WORLD_WIDTH, 20);
    this.ctx.fill();
  }
}

/**
 * Loads GrassBitmap into a sprite so physics can be applied
 */
export class GrassSprite extends Phaser.Sprite {
  constructor ({ game = {} } = {}) {
    super(game, WORLD_WIDTH / 2, game.world.height - 20, new GrassBitmap({ game }));
    game.add.existing(this);
    this.anchor.setTo(0, 0);
    game.physics.p2.enable(this, false, true);
    this.body.kinematic = true;
  }
}
