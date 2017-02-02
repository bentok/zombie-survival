/**
 * Sets up the bitmap canvas and sprite for the sky.
 */

/**
 * Configuration of health bar.
 * @type {Object}
 */
const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  x: 0,
  y: 0,
  bg: {
    color: '#7ec0ee'
  },
  bar: {
    color: '#AB1111'
  },
  animationDuration: 200
};

/**
 * Canvas drawing for sky.
 */
class SkyCanvas extends Phaser.BitmapData {
  constructor ({ game = {}, width = window.innerWidth } = {}) {
    super(game, 'sky', width, config.height);
    this.ctx.fillStyle = config.bg.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, config.height);
    this.ctx.fill();
  }
}

/**
 * Loads sky canvas as a sprite to allow tweening of color.
 */
export class SkySprite extends Phaser.Sprite {

  constructor ({ game = {}, width = window.innerWidth } = {}) {
    super(game, config.x, config.y, new SkyCanvas({ game, width }));
    game.add.existing(this);
  }

}
