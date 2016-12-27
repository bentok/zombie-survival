<<<<<<< HEAD:src/states/zone1/zone1.js
import { EnvironmentManager } from '../../environment/environment.manager';
=======
import { EnvironmentManager } from './environment.manager';
>>>>>>> Adds environment manager to build a zone based on imported configs:src/states/zone1/zone1.js
import { PlayerManager } from '../../player/player.manager';
import { LayerManager } from '../../layerManager/layerManager';
import { EnemyManager } from '../../enemyManager/enemyManager';
import { GrassSprite } from '../../environment/grass.sprite';
<<<<<<< HEAD:src/states/zone1/zone1.js
import { CONFIG } from './zone1.config';
=======
import { WORLD_WIDTH } from './zone1.config';
>>>>>>> Adds environment manager to build a zone based on imported configs:src/states/zone1/zone1.js

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
    this.ground = new GrassSprite({ game: this.game });
    this.environment = new EnvironmentManager({ game: this.game, config: CONFIG });
    /**
     * Phaser.World.setBounds(x, y, width, height )
     * x — Top left most corner of the world..
     * y — Top left most corner of the world.
     * width — New width of the game world in pixels.
     * height — New height of the game world in pixels.
     */
    this.game.world.setBounds(0, 0, CONFIG.WORLD_WIDTH, window.innerHeight);
  }

}
