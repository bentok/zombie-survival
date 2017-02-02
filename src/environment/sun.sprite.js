/**
 * @class SunSprite
 */
export class SunSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   */
  constructor ({ game = {}, location = {}, scale = 1 } = {}) {
    super(game, location.x, location.y, 'sky');
    this.config = {
      scale,
      location,
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render () {
    this.game.add.existing(this);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
    this.fixedToCamera = true;
  }

  /**
   * Displays a still frame or an animation on update loop
   */
  update () {
    this.frameName = 'sun';
  }

}
