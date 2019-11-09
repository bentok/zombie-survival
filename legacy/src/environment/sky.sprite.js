import { LayerManager } from '../layerManager/layerManager';
import { MoonSprite } from './moon.sprite';
import { SunSprite } from './sun.sprite';
import { DayCycle } from './dayCycle.service';

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
    color: '#2B97FC'
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
    this.dayCycle = new DayCycle({ game });
    game.add.existing(this);
    this.game = game;
    this.render();
  }

  /**
   * Renders sky and initializes sky events
   */
  render () {

    this.moonSprite = new MoonSprite({ 
      game: this.game, 
      location: { 
        x: this.game.width - this.game.width / 4,
        y: this.game.height + 500,
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.moonSprite);

    this.sunSprite = new SunSprite({
      game: this.game,
      location: {
        x: 50, 
        y: -250,
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.sunSprite);

    // Extendable array of sky shades for tweening
    const skyTones = [
        { sprite: this, from: 0x1f2a27, to: 0x7ec0ee }
    ];

    // Init tweening of sky color, sun and moon
    this.dayCycle.initShading(skyTones);
    this.dayCycle.initSun(this.sunSprite);
    this.dayCycle.initMoon(this.moonSprite);
  }

}
