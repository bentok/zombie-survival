"use strict";

class HealthTimer {

  constructor(player){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                     // I could pass the game object to the constructor.

    this.timer = this.game.time.create(false);
    this.player = player || {};

    this.config = {
      width: 780,
      height: 12,
      x: 10,
      y: 580,
      bg: {
          color: '#404040'
      },
      bar: {
          color: '#AB1111'
      },
      animationDuration: 200
    };

    this.healthLossIncrement = 0.1;
    this.increment = 100;

    this.render();
  }

  render(){

    drawBackground.call(this);
    drawBar.call(this);
    setFixed.call(this);

    this.timer.loop(this.increment, this.updateCounter, this);


    function drawBackground(){
      let back = this.game.add.bitmapData(this.config.width, this.config.height);
      back.ctx.fillStyle = this.config.bg.color;
      back.ctx.beginPath();
      back.ctx.rect(0, 0, this.config.width, this.config.height);
      back.ctx.fill();

      this.bgSprite = this.game.add.sprite(this.config.x, this.config.y, back);
      this.bgSprite.anchor.set(0);
    }

    function drawBar(){
      let bar = this.game.add.bitmapData(this.config.width, this.config.height);
      bar.ctx.fillStyle = this.config.bar.color;
      bar.ctx.beginPath();
      bar.ctx.rect(0, 0, this.config.width - 10, this.config.height/2);
      bar.ctx.fill();

      this.barSprite = this.game.add.sprite(this.config.x + 5 , this.config.y + this.bgSprite.height/4, bar);
      this.barSprite.anchor.set(0);
    };

    function setFixed(){
      this.bgSprite.fixedToCamera = true;
      this.barSprite.fixedToCamera =true;
    };

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
    this.game.add.tween(this.barSprite).to( { width: (this.player.health / this.player.maxHealth) * (this.config.width) }, this.config.animationDuration, Phaser.Easing.Linear.None, true);
    if(this.player.health <= 0){
      this.stop();
    }
  }

} //emd HealthTimer class
