"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var character;
var graphics;
var healthBar;
var p;

function preload() {
  // Player graphic
  game.load.image('p', 'images/ani1.png');
}

function create() {
  // Initialize arcade physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  
  // Initialize the man named P
  p = game.add.sprite(game.world.width *0.5, game.world.height - 160, 'p');
  
  // Give P some archade physics
  game.physics.enable(p, Phaser.Physics.ARCADE);

  game.stage.backgroundColor = '#2d2d2d';

  graphics = game.add.graphics(0,0);
  graphics.beginFill(0xE0042D);
  graphics.lineStyle(2, 0xFFFFFF, 0.8);
  healthBar = graphics.drawRect(10, 590, 780, 6);
  graphics.endFill();

  character = new Player();

  character.healthTimer.loop({increment:1000, action:updateCounter});
  character.healthTimer.start();
}

function update() {
  healthBar.width = Math.floor((character.health / character.maxHealth) * 780);
  
  // Control the man named P with x axis mouse input
  p.x = game.input.x || game.world.width * 0.5;
}

function updateCounter(){
  character.health = character.health - 10;
  console.log(character.health, (character.health / character.maxHealth), healthBar.width);
  if(character.health <= 0){
    character.healthTimer.stop();
  }
}
