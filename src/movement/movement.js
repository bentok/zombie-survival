"use strict";

class Movement {
  
  moveLeft(target, speed, animationName) {
    target.body.velocity.set(speed * -10, 0);
    target.animations.play(animationName);
  }
  
  moveRight(target, speed, animationName) {
    target.body.velocity.set(speed * 10, 0);
    target.animations.play(animationName);
  }
  
  idle(target, speed, animationName) {
    target.body.velocity.set(0, 0);
    target.animations.play(animationName);
  }
  
}