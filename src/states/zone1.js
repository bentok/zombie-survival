import { Player } from '../player/player';
import { Sprites } from '../sprites/sprites';
import { World } from '../world/world';
import { LayerManager } from '../layerManager/layerManager';

export class Zone1 extends Phaser.State {

  /**
   * Preload
   */
  preload () {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    this.game.stage.backgroundColor = '#2d2d2d';

    this.game.layerManager = new LayerManager({ game: this.game });
    this.game.layerManager.setup();

    new Sprites({ game: this.game }).load();
  }

  /**
   * Create
   */
  create () {
    this.player = new Player({ game: this.game, speed: 25 });
    this.world = new World({ game: this.game, character: this.player });
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
