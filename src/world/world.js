"use strict";

class World{

  constructor(){
    this.game = game;
    this.level = 1;
    this.gravity = 200;

    //test
    this.enemies = [new Zombie(), new Zombie({speed:10}), new Zombie({speed:5})];
  }

  setup(){
    this.setGravity(this.gravity);
    this.makeGround();
  }

  setGravity(newGravity){
    this.game.physics.arcade.gravity.y = newGravity;
  }

  makeGround(){
    var ground = this.game.add.bitmapData(game.world.width, 5);
    ground.ctx.fillStyle = '#360';
    ground.ctx.beginPath();
    ground.ctx.rect(0, 0, game.world.width, 5);
    ground.ctx.fill();

    this.sprite = this.game.add.sprite(0, game.world.height - 35, ground);

    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);


    this.sprite.body.allowGravity = false;
    this.sprite.body.immovable = true;
    //todo build ground and collider
  }

  collisions(){
    for(let enemy of this.enemies){
      this.game.physics.arcade.collide(enemy.sprite, this.sprite, ()=>{}, null, this);
    }

    
  }

}
