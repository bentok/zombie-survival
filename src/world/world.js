"use strict";

class World{

  constructor(){
    this.game = game;
    this.level = 1;
    this.gravity = 200;

    this.enemies = [new Zombie(), new Zombie({speed:10}), new Zombie({speed:1.5})];
    this.character = new Player();
  }

  setup(){
    this.setGravity(this.gravity);
    this.makeGround();

    this.character.render();
    this.character.healthTimer.start();

    for(let enemy of this.enemies){
      enemy.render();
    }

    let healthTest = new TestButtons(this.character);
    healthTest.drawHealthButtons();

  }

  setGravity(newGravity){
    this.game.physics.arcade.gravity.y = newGravity;
  }

  makeGround(){
    let ground = this.game.add.bitmapData(game.world.width, 5);
    ground.ctx.fillStyle = '#360';
    ground.ctx.beginPath();
    ground.ctx.rect(0, 0, game.world.width, 5);
    ground.ctx.fill();

    this.sprite = this.game.add.sprite(0, game.world.height - 35, ground);

    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

    this.sprite.body.allowGravity = false;
    this.sprite.body.immovable = true;
  }

  update(){
    for(let enemy of this.enemies){
      this.game.physics.arcade.collide(enemy.sprite, this.sprite, ()=>{}, null, this);
      this.game.physics.arcade.collide(enemy.sprite, this.character.sprite, ()=>{}, null, this);
      enemy.update();
      for(let other of this.enemies){
        this.game.physics.arcade.collide(enemy.sprite, other.sprite, ()=>{}, null, this);
      }
    }
    this.game.physics.arcade.collide(this.character.sprite, this.sprite, ()=>{}, null, this);

    this.character.update();
  }

}
