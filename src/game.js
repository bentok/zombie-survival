import { Player } from './player/player';
import { Sprites } from './sprites/sprites';
import { World } from './world/world';
import { LayerManager } from './layerManager/layerManager';

class Main {

  constructor () {
    /**
     * Bootstraps the game and execute Phaser lifecycle hooks
     */
    this.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: this.preload, create: this.create, update: this.update });
  }

  /**
   * Preload
   */
  preload () {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    this.game.stage.backgroundColor = '#2d2d2d';

    this.game.layerManager = new LayerManager();
    this.game.layerManager.setup();

    new Sprites().load();
  }
  /**
   * Create
   */
  create () {
    this.player = new Player({ speed: 25 });
    this.world = new World({ character: this.player });
    // this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.world.setup();
  }

  /**
   * Update
   */
  update () {
    this.world.update();
  }
}

export const game = new Main().game;


