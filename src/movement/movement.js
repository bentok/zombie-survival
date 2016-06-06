/*
*  The Move class assumes that the spritesheet is given the name of "sprite".
*  It also assumes animations have a common naming convention (such as "runRight"),
*  as it checks the Player.sprite._anims object for the corresponding animation name. If the animation
*  name is not found, the object moves without animating.
*/

import { game } from '../game';
import { Animate } from '../animate/animate';

export class Move {

  constructor (obj) {
    this.game = game;
    this.character = obj;
    this.animate = new Animate(this.character);
  }

  register (name = '', animation = undefined, direction = '', moving = false) {
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
