"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var character;
var enemy;

function preload() {
  game.stage.backgroundColor = '#2d2d2d';
  character = new Player();
  enemy = new Zombie();
}

function create() {
  character.healthTimer.start();

  var healthTest = new TestButtons(character);
  healthTest.drawHealthButtons();

  var graphics = game.add.graphics(0,0);
  graphics.beginFill(0x000000);
  var sky = graphics.drawRect(0, 50, game.world.width, game.world.height - 80);
  graphics.endFill();

  console.log(sky);

  sky.alpha = 0.5;

  // game.add.sprite(0, 0, sky);



}

function update() {


  // enemy.sprite.body.velocity.setTo(0, 0);

  // enemy.sprite.position.x -= 2;




}
