import { EnvironmentManager } from '../../environment/environment.manager';
import { PlayerManager } from '../../player/player.manager';
import { LayerManager } from '../../layerManager/layerManager';
import { EnemyManager } from '../../enemyManager/enemyManager';
import { store as config } from './zone1.config';

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
    this.game.load.atlas('trees', './dist/atlases/trees/trees.png', './dist/atlases/trees/trees.json');
    this.game.load.atlas('ground', './dist/atlases/tilemaps/tiles.png', './dist/atlases/tilemaps/tiles.json');
    this.game.load.atlas('sky', './dist/atlases/sky/sky.png', './dist/atlases/sky/sky.json');
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
    this.game.enemyManager = new EnemyManager({ game: this.game });
    this.player = new PlayerManager({ game: this.game });
    this.game.enemyManager.addZombie( { player: this.player.sprite } );
    this.environment = new EnvironmentManager({ game: this.game, config: config.getState() });
    /**
     * Phaser.World.setBounds(x, y, width, height )
     * x — Top left most corner of the world..
     * y — Top left most corner of the world.
     * width — New width of the game world in pixels.
     * height — New height of the game world in pixels.
     */
    this.game.world.setBounds(0, 0, config.getState().worldWidth, window.innerHeight);
  }

}
