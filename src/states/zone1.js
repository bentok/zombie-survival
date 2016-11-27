import { Player } from '../player/player';
import { LayerManager } from '../layerManager/layerManager';
import { HealthBarSprite } from '../healthBar/healthBar';

export class Zone1 extends Phaser.State {

  /**
   * Preload
   */
  preload () {
    // Load sprites and manage layers
    this.game.load.spritesheet('player', './dist/images/player-sprite-sheet.png', 81, 135, 14);
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
    this.healthBar = new HealthBarSprite({ game: this.game, character: this.player });
  }

  /**
   * Update
   */
  update () {
    this.world.update();
  }

}
