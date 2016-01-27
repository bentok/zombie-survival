"use strict";

class Zombie {

  constructor({ speed = 2, health = 25 } = {}){
    this.game = game;
    this.health = health;
    this.speed = speed;

    this.move = new Move(this);

    this.init();
  }

  update(){
    this.move.runRight();
  }

  init(){
    this.game.load.spritesheet('zombie', '/src/images/zombieTest.png', 66, 134, 1);
  }

  render(){

    this.sprite = this.game.enemyLayer.create(this.game.world.width * 0.5 + 50, this.game.world.height - 170, 'zombie');
    //Add zombie graphic to physcics.
    game.physics.enable([ this.sprite ], Phaser.Physics.ARCADE);
    this.sprite.body.bounce.set(0.2);
    this.sprite.body.collideWorldBounds = true; // temp stop from falling TODO:remove when bottom created.

  }

}
