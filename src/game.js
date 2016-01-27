"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var world;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

  game.stage.backgroundColor = '#2d2d2d';

  game.enemyLayer = game.add.group();
  game.playerLayer = game.add.group();
  game.world.bringToTop(game.playerLayer);

  world = new World();
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  world.setup();

  // var graphics = game.add.graphics(0,0);
  // graphics.beginFill(0x000000);
  // var sky = graphics.drawRect(0, 50, game.world.width, game.world.height - 80);
  // graphics.endFill();
  //
  // console.log(sky);
  //
  // sky.alpha = 0.5;

  // game.add.sprite(0, 0, sky);
}

function update() {
  world.update();
}
