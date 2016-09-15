import { Player } from './player/player';
import { Sprites } from './sprites/sprites';
import { World } from './world/world';

export const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload, create, update });

let world;
let player;

function preload () {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

  game.stage.backgroundColor = '#2d2d2d';

  game.skyLayer = game.add.group();
  game.enemyLayer = game.add.group();
  game.playerLayer = game.add.group();
  game.world.bringToTop(game.playerLayer);

  player = new Player({ speed: 25 });
  world = new World({ character: player });
  new Sprites().load();

}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  world.setup();
}

function update () {
  world.update();
}
