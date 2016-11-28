import { Player } from '../player/player';
import { LayerManager } from '../layerManager/layerManager';

export class Zone1 extends Phaser.State {

  /**
   * Preload
   */
  preload () {
    // Load sprites and manage layers
    this.game.load.spritesheet('player', './dist/images/player-run.png', 450, 450, 6);
    this.game.layerManager = new LayerManager({ game: this.game });
    this.game.layerManager.setup();
    
    // Set game scale
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
  }

  /**
   * Create
   */
  create () {
    this.player = new Player({ game: this.game, speed: 25 });
  }

  /**
   * Update
   */
  update () {
    this.world.update();
  }

}
