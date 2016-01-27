"use strict";

/*
*  The Animate class requires a standard naming convention for animation names.
*/

class Animate {

  constructor(obj) {
    this.game = game;
    this.character = obj;
  }

  runRight() {
    this.character.sprite.animations.play('runRight');
  }

  runLeft() {
    this.character.sprite.animations.play('runLeft');
  }

  idleRight() {
    this.character.sprite.animations.play('idleRight');
  }

  idleLeft() {
    this.character.sprite.animations.play('idleLeft');
  }

}
