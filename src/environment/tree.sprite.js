/**
 * Tree sprite is used for background trees and can load various types of trees from an atlas
 * 
 * @class TreeSprite
 */
export class TreeSprite extends Phaser.Sprite {

  /**
   * @param  {Object} game Reference to the state's game object
   */
  constructor ({ game = {}, location = {}, scale = 1 } = {}) {

    super(game, location.x, location.y, 'trees');
    this.config = {
      scale: 1,
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render () {
    this.game.add.existing(this);
    this.frameName = 'tree1';
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(1, 1);
    this.game.layerManager.layers.get('environmentLayer').add(this);
  }

}
