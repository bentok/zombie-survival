import { game } from '../game';

export class Animate {

  constructor (obj) {
    this.game = game;
    this.character = obj;
  }

  register (name, animation) {
    this[name] = () => {
      this.character.sprite.animations.play(animation.name);
    };
  }

}
