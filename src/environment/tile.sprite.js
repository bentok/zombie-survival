/**
 * TileSprite is an individual tile rendered by the tile generator
 * 
 * @class TileSprite
 */
export class TileSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   * @param {String} tileName Name of the tile to render
   */
  constructor ({ game = {}, location = {}, scale = 1, tileName = 'grass-light' } = {}) {
    super(game, location.x, location.y, 'ground');
    this.config = {
      scale,
      location,
      tileName,
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render () {
    this.game.add.existing(this);
    /**
     * Phaser.Animations.add(name, generateFrameNames, frameRate, loop )
     * name — Name ot assign the animation
     * generateFrameNames — Phaser automatically will grab oak1 through oak3
     * frameRate — Frame rate to play animation
     * loop — Whether or not to loop the animation
     */
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
    this.game.physics.p2.enable(this, false, true);
    this.body.kinematic = true;
  }

  /**
   * Sets the frame to the tile that needs to be displayed
   */
  update () {
    this.frameName = this.config.tileName;
  }

}
