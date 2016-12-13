import { LayerManager } from '../layerManager/layerManager';

/**
 * Sets up the bitmap canvases and sprites for the health bar and health bar background.
 */

/**
 * Configuration of health bar.
 * @type {Object}
 */
const config = {
  width: 300,
  height: 12,
  x: 10,
  y: 10,
  bg: {
    color: '#404040'
  },
  bar: {
    color: '#AB1111'
  },
  animationDuration: 200
};

/**
 * Canvas drawing for health bar background.
 */
class HealthBarBGCanvas extends Phaser.BitmapData {
  constructor ({ game = {} } = {}) {
    super(game, 'health bar background', config.width, config.height);
    this.ctx.fillStyle = config.bg.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, config.width, config.height);
    this.ctx.fill();
  }
}

/**
 * Loads health bar background canvas as sprite.
 */
class HealthBarBGSprite extends Phaser.Sprite {
  constructor ({ game = {} } = {}) {
    super(game, config.x, config.y, new HealthBarBGCanvas({ game }));
    game.add.existing(this);
  }
}

/**
 * Canvas drawing for health bar.
 */
class HealthBarCanvas extends Phaser.BitmapData {
  constructor ({ game = {} } = {}) {
    super(game, 'health bar', config.width, config.height);
    this.ctx.fillStyle = config.bar.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, config.width - 10, config.height / 2);
    this.ctx.fill();
  }
}

/**
 * Loads health bar canvas as a sprite and render all healthbar assets.
 */
export class HealthBarSprite extends Phaser.Sprite {

  constructor ({ game = {}, character = {} } = {}) {
    super(game, config.x + 5, config.y + 3, new HealthBarCanvas({ game }));
    game.add.existing(this);

    this.character = character;
    this.layerManager = new LayerManager();

    this.render();
  }
  
  /**
   * Render the healthbar background and load both sprites into the layer manager.
   */
  render () {
    this.healthBarBG = new HealthBarBGSprite({ game: this.game });
    this.game.layerManager.layers.get('uiLayer').add(this.healthBarBG);
    this.game.layerManager.layers.get('uiLayer').add(this);

    this.fixedToCamera = true;
    this.healthBarBG.fixedToCamera = true;
  }

  /**
   * Tween health bar when there is a change in player's heatlh.
   */
  update () {
    this.game.add.tween(this).to( { width: this.character.state.health / this.character.state.maxHealth * config.width }, config.animationDuration, Phaser.Easing.Linear.None, true);
  }

}
