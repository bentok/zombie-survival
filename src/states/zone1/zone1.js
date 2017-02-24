import { EnvironmentManager } from '../../environment/environment.manager';
import { TreeSprite } from '../../environment/tree.sprite';
import { TileSprite } from '../../environment/tile.sprite';
import { PlayerManager } from '../../player/player.manager';
import { LayerManager } from '../../layerManager/layerManager';
import { EnemyManager } from '../../zombie/enemyManager';
import { SkySprite } from '../../environment/sky.sprite';
import { store } from './zone1.config'; 

const config = store.getState();

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
    this.skySprite = new SkySprite({ game: this.game, width: config.worldWidth });
    this.game.layerManager.layers.get('skyLayer').add(this.skySprite);
    this.renderTrees();
    this.renderTiles();
    /**
     * Phaser.World.setBounds(x, y, width, height )
     * x — Top left most corner of the world..
     * y — Top left most corner of the world.
     * width — New width of the game world in pixels.
     * height — New height of the game world in pixels.
     */
    this.game.world.setBounds(0, 0, config.worldWidth, window.innerHeight);
  }

  /**
   * Sets up the trees based on the settings provided in a given zone's config object
   */
  renderTrees () {
    for (const tree of config.trees) {
      const treeToAdd = new TreeSprite({ 
        game: this.game,
        location: { x: tree.x, y: tree.y },
        scale: tree.scale,
      });
      this.game.layerManager.layers.get('environmentLayer').add(treeToAdd);
    }
  }

  /**
   * Renders a zone's tiles based on a config file
   */
  renderTiles () {
    for (const [key, value] of config.tiles.entries()) {
      for (const tile of value) {
        const tileToAdd = new TileSprite({ 
          game: this.game,
          location: { x: tile.x, y: tile.y },
          scale: tile.scale,
          tileName: tile.tileName,
        });
        this.game.layerManager.layers.get('environmentLayer').add(tileToAdd);
      }
    }
  }

}
