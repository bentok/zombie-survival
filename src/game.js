import { Player } from './player/player';
import { Sprites } from './sprites/sprites';
import { World } from './world/world';
import { LayerManager } from './layerManager/layerManager';

/**
 * Bootstraps the game and execute Phaser lifecycle hooks
 */
export const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload, create, update });

let world;
let player;

/**
 * preload
 */
function preload () {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

  game.stage.backgroundColor = '#2d2d2d';

  game.layerManager = new LayerManager();
  game.layerManager.setup();

  player = new Player({ speed: 25 });
  world = new World({ character: player });
  new Sprites().load();
}
/**
 * create
 */
function create () {
  // game.physics.startSystem(Phaser.Physics.ARCADE);
  world.setup();
}

/**
 * update
 */
function update () {
  world.update();
}
