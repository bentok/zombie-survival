"use strict";

/* 
*  The Move class assumes that the spritesheet is given the name of "sprite".
*  It also assumes animations have a common naming convention (such as "runRight"),
*  as it checks the Player.sprite._anims object for the corresponding animation name. If the animation
*  name is not found, the object moves without animating.
*/

class Move {
  
  constructor(obj) {
    this.game = game;
    this.character = obj;
    
    this.animate = new Animate(this.character);
  }
  
  runLeft() {
    this.character.sprite.body.velocity.set(this.character.speed * -10, 0);
    this.character.direction = 'left';
    if (this.character.sprite.animations._anims.runLeft) {
      this.animate.runLeft();
    }
  }
  
  runRight() {
    this.character.sprite.body.velocity.set(this.character.speed * 10, 0);
    this.character.direction = 'right';
    if (this.character.sprite.animations._anims.runRight) {
      this.animate.runRight();
    }
  }
  
  idle() {
    this.character.sprite.body.velocity.set(0, 0);
    if (this.character.sprite.animations._anims.idleLeft && this.character.direction === 'left') {
      this.animate.idleLeft();
    }
    if (this.character.sprite.animations._anims.idleRight && this.character.direction === 'right') {
      this.animate.idleRight();
    }
  }
  
}