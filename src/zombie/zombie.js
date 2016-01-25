"use strict";

class Zombie {

  constructor(){
    this.game = game;
    this.health = 25;
    this.speed =3;

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.render();

    // this.moveLeft(200);

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
