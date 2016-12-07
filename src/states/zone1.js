import { PlayerManager } from '../player/player.manager';
import { LayerManager } from '../layerManager/layerManager';
import { EnemyManager } from '../enemyManager/enemyManager';

export class Zone1 extends Phaser.State {

  /**
   * Preload
   */
  preload () {
    // Load sprites and manage layers
    this.game.load.atlas('player', './dist/atlases/player/player.png', './dist/atlases/player/player.json');
    this.game.load.physics('player-polygon', './dist/atlases/player/player-polygon.json');
    this.game.load.atlas('zombie', './dist/atlases/zombie/zombie.png', './dist/atlases/zombie/zombie.json');
    this.game.load.physics('zombie-polygon', './dist/atlases/zombie/zombie-polygon.json');
    this.game.layerManager = new LayerManager({ game: this.game });
    this.game.layerManager.setup();
    this.game.enemyManager = new EnemyManager({ game: this.game });

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
    this.player = new PlayerManager({ game: this.game });
    this.game.enemyManager.addZombie( { player: this.player.sprite } );
  }

}
