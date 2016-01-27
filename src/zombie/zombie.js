"use strict";

class Zombie {

  constructor({ speed = 2, health = 25 } = {}){
    this.game = game;
    this.health = health;
    this.speed = speed;

    this.render();

    this.update();

  }

  update(dir){
    if(dir === 'left'){
      this.moveLeft(200);
      this.motion.onComplete.add(()=>{ this.update('right') }, this);
    } else {
      this.moveRight(200);
      this.motion.onComplete.add(()=>{ this.update('left') }, this);
    }
  }

  render(){

    /*  Place holder for Zombie graphic*/
    {
      let zombie = this.game.add.bitmapData(25, 100);
      zombie.ctx.fillStyle = '#FFF';
      zombie.ctx.beginPath();
      zombie.ctx.rect(0, 0, 25, 100);
      zombie.ctx.fill();


      this.sprite = this.game.add.sprite(this.game.world.width * 0.5 + 50, this.game.world.height - 150, zombie);

    }
    //Add zombie graphic to physcics.
    game.physics.enable([ this.sprite ], Phaser.Physics.ARCADE);
    this.sprite.body.bounce.set(1);
    this.sprite.body.collideWorldBounds = true; // temp stop from falling TODO:remove when bottom created.

  }

  moveLeft(distance){
    distance = distance || 5;
    this.motion = game.add.tween(this.sprite).to( { x: this.sprite.position.x - distance }, distance * 100/this.speed, null, true);
  }

  moveRight(distance){
    distance = distance || 5;
    this.motion = game.add.tween(this.sprite).to( { x: this.sprite.position.x + distance }, distance * 100/this.speed, null, true);
  }


}
