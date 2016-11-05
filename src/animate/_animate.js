// import { game } from '../game';

/**
 *  Animation
 *  @class  Animation
 */

export class Animate {

/**
 * @param  {Object} obj The object being animated.
 */
  constructor (obj) {
    this.awesome = false;
    console.log('new Animate created');
    // this.game = game;
    // this.character = obj;
  }

  enableAwesome(v) {
    this.awesome = v;
  }

  /**
   * @param  {String} name The name of the animation.
   * @param  {Object} animation Animation object.
   */
  register (name, animation) {
    console.log('register');
    // this[name] = () => {
    //   this.character.sprite.animations.play(animation.name);
    // };
  }

}
