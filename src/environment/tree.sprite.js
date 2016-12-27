/**
 * Tree sprite is used for background trees and can load various types of trees from an atlas
 * 
 * @class TreeSprite
 */
export class TreeSprite extends Phaser.Sprite {

  /**
<<<<<<< HEAD
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   * @param {String} stillFrameName Name to render sprite when no animation is playing
   * @param {Boolean} isAnimated Whether or not the sprite should be animated 
   */
  constructor ({ game = {}, location = {}, scale = 1, stillFrameName = 'oak1', isAnimated = false } = {}) {

    super(game, location.x, location.y, 'trees');
    this.config = {
      scale,
      stillFrameName,
      isAnimated,
      location,
=======
   * @param  {Object} game Reference to the state's game object
   */
  constructor ({ game = {}, location = {}, scale = 1 } = {}) {

    super(game, location.x, location.y, 'trees');
    this.config = {
      scale: 1,
>>>>>>> Adds trees
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render () {
    this.game.add.existing(this);
<<<<<<< HEAD
    /**
     * Phaser.Animations.add(name, generateFrameNames, frameRate, loop )
     * name — Name ot assign the animation
     * generateFrameNames — Phaser automatically will grab oak1 through oak3
     * frameRate — Frame rate to play animation
     * loop — Whether or not to loop the animation
     */
    this.animations.add('sway', Phaser.Animation.generateFrameNames('oak', 1, 4), 1, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
  }

  /**
   * Displays a still frame or an animation on update loop
   */
  update () {
    if (this.config.isAnimated) {
      this.animations.play('sway');
    } else {
      this.frameName = this.config.stillFrameName;
    }
=======
    this.frameName = 'tree1';
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(1, 1);
    this.game.layerManager.layers.get('environmentLayer').add(this);
>>>>>>> Adds trees
  }

}
