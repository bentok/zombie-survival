/**
 * Tree sprite is used for background trees and can load various types of trees from an atlas
 * 
 * @class TreeSprite
 */
export class GrassSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   * @param {String} stillFrameName Name to render sprite when no animation is playing
   * @param {Boolean} isAnimated Whether or not the sprite should be animated 
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
   * Displays a still frame or an animation on update loop
   */
  update () {
    this.frameName = this.config.tileName;
  }

}
