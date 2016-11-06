import { game } from '../game';
import { Animate } from '../animate/animate';

/*
*  The Move class assumes that the spritesheet is given the name of "sprite".
*  It also assumes animations have a common naming convention (such as "runRight"),
*  as it checks the Player.sprite._anims object for the corresponding animation name. If the animation
*  name is not found, the object moves without animating.
*/

/**
 * @class Move
 */
export class Move {
  /**
   * @param  {Object} obj NAy objectthat will need animations registered to it.
   */
  constructor (obj) {
    this.game = game;
    this.character = obj;
    this.animate = new Animate(this.character);
  }
/**
 * Register the sprite animation to the object.
 * @param  {String} name The name of the animation.
 * @param  {Object} animation The animation object to register the animation too.
 * @param  {String} direction The direction the animation velocity should be set to.
 * @param  {Boolean} moving Flag to determine if the objust should be moving.
 */
  register (name = '', animation = {}, direction = '', moving = false) {
    if (!name) {
      throw new Error('Method name required!');
    }
    if (animation) {
      this.animate.register(name, animation);
    }
    this[name] = () => {
      if (moving) {
        if (direction === 'left') {
          this.character.sprite.body.velocity.set(this.character.speed * -10, 0);
          this.character.direction = 'left';
        } else {
          this.character.sprite.body.velocity.set(this.character.speed * 10, 0);
          this.character.direction = 'right';
        }
      } else {
        this.character.sprite.body.velocity.set(0, 0);
      }
      if (animation) {
        this.animate[name]();
      }
    };
  }

}
