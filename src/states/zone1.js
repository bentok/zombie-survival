import { Player } from '../player/player';
import { LayerManager } from '../layerManager/layerManager';
import { HealthBarSprite } from '../healthBar/healthBar';

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

    // Set Physics for Zone
    this.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.gravity.y = 1000;
  }

  /**
   * Create
   */
  create () {

    // Setup Player
    this.player = new Player({ game: this.game, speed: 25 });
    this.healthBar = new HealthBarSprite({ game: this.game, character: this.player });
  }

}
