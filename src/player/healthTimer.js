"use strict";

class HealthTimer {

  constructor(player){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                     // I could pass the game object to the constructor.

    this.timer = this.game.time.create(false);
    this.player = player || {};
    this.healthLossIncrement = 1;
    this.increment = 100;
    this.render();
  }

  render(){
    let graphics = game.add.graphics(0,0);
    graphics.beginFill(0xE0042D);
    graphics.lineStyle(2, 0xFFFFFF, 0.8);
    this.healthBar = graphics.drawRect(30, 590, 740, 6);
    graphics.endFill();

    this.timer.loop(this.increment, this.updateCounter, this);
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

  /*
    Sets new health reduction increment.
  */
  setIncrement(newIncrement){
    this.healthLossIncrement = newIncrement;
  }

  /*
    Update function for loop.
  */
  updateCounter(){
    this.player.health = this.player.health - this.healthLossIncrement;
    if(this.player.health <= 0){
      this.stop();
    }
  }

  update(){
    this.healthBar.width = Math.floor((this.player.health / this.player.maxHealth) * 780);
  }

}
