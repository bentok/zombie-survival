import { game } from '../game';

/**
 *  Animation
 *  @class  Animation
 */

export class Animate {

/**
 * @param  {Object} obj The object being animated.
 */
  constructor (obj) {
    this.game = game;
    this.character = obj;
  }

  /**
   * @param  {String} name The name of the animation.
   * @param  {Object} animation Animation object.
   */
  register (name, animation) {
    this[name] = () => {
      this.character.sprite.animations.play(animation.name);
    };
  }

}
