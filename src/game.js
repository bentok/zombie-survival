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
}

function update() {

  // enemy.sprite.body.velocity.setTo(0, 0);

  // enemy.sprite.position.x -= 2;




}
