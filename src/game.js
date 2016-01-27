"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var character;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  
  game.stage.backgroundColor = '#2d2d2d';
  character = new Player();
}

function create() {
  // Initialize arcade physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  character.render();
  character.healthTimer.start();

  var healthTest = new TestButtons(character);
  healthTest.drawHealthButtons();
}

function update() {
   character.update();
}
