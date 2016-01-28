"use strict";

/*
*  The Animate class requires a standard naming convention for animation names.
*  Not anymore ;)
*/

class Animate {

  constructor(obj) {
    this.game = game;
    this.character = obj;
  }

  register(name, animation){
    this[name] = () => {
      this.character.sprite.animations.play(animation.name);
    }
  }

}
