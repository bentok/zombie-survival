"use strict";

class HealthTimer {
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                     // I could pass the game object to the constructor.
    this.timer = this.game.time.create(false);
  }

  /*
    Setup iteration increment and action per iteration while loop is running.
  */
  loop(opts){
    opts = (typeof opts == 'object') ? opts : {};
    this.increment = opts.increment || 1000;
    this.action = opts.action || function(){};
    this.timer.loop(this.increment, this.action, this);
    return this;
  }

  /*
    Start the healthbar timer
  */
  start(){
    this.timer.start();
    return this.timer;
  }

  /*
    Stop the healthbar timer.
  */
  stop(){
    this.timer.stop();
  }

}
