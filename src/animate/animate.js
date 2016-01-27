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
    character.sprite.animations.play('runRight');
  }
  
  runLeft() {
    character.sprite.animations.play('runLeft');
  }
  
  idleRight() {
    character.sprite.animations.play('idleRight');
  }
  
  idleLeft() {
    character.sprite.animations.play('idleLeft');
  }
  
}