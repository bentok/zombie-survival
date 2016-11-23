import { DayCycle } from './DayCycle';
import { game } from '../game';

/**
 * Creates sky, sun and moon sprites
 */

export class Sky extends Phaser.State {

  constructor ({ game = {} } = {}) {
    // Must execture super before defining properties in constructor
    super();
    this.game = game;
  }

  /**
   * Render sky, sun and moon
   */
  create () {
    this.game.stage.backgroundColor = '#000';
    this.dayCycle = new DayCycle({ game: this.game, dayLength: 50000 });

    // Define sky canvas
    const sky = this.game.add.bitmapData(this.game.width, this.game.height);
    sky.ctx.rect(0, 0, this.game.width, this.game.height);
    sky.ctx.fillStyle = '#7ec0ee';
    sky.ctx.fill();

    // Load assets to as sprites
    this.skySprite = this.game.layerManager.layers.get('environmentLayer').create(0, 0, sky);
    this.sunSprite = this.game.layerManager.layers.get('environmentLayer').create(50, -250, 'sun');
    this.moonSprite = this.game.layerManager.layers.get('environmentLayer').create(this.game.width - this.game.width / 4, this.game.height + 500, 'moon');

    // Extendable array of sky shades for tweening
    const backgroundSprites = [
        { sprite: this.skySprite, from: 0x1f2a27, to: 0x7ec0ee }
    ];

    // Init tweening of sky color, sun and moon
    this.dayCycle.initShading(backgroundSprites);
    this.dayCycle.initSun(this.sunSprite);
    this.dayCycle.initMoon(this.moonSprite);
  }

}
