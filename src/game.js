"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var character;

function preload() {
  game.stage.backgroundColor = '#2d2d2d';
  character = new Player();
}

function create() {
  // Initialize arcade physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  character.loadPlayer();
  character.loadPlayerControls();
  character.healthTimer.start();

  var healthTest = new TestButtons(character);
  healthTest.drawHealthButtons();
}

function update() {
   character.keyboardInput();
}
