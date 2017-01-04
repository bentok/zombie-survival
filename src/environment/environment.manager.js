import { LayerManager } from '../layerManager/layerManager';
import { TreeSprite } from './tree.sprite';
import { TileSprite } from './tile.sprite';

/**
 * @class EnvironmentManager
 * 
 * Fires a series of methods to set up the environment unique to the parent state
 */

export class EnvironmentManager {
  /**
   * @param {Object} game Reference to the state's game object
   */
  constructor ({ game = {}, config = {} } = {}) {
    this.game = game;
    this.config = config;

    this.init();
  }

  /**
   * Run when the class is initialized
   */
  init () {
    this.renderTrees();
    this.renderTiles();
  }

  /**
   * Sets up the trees based on the settings provided in a given zone's config object
   */
  renderTrees () {
    if (this.config.TREES) {
      for (const tree of this.config.TREES) {
        const treeToAdd = new TreeSprite({ 
          game: this.game,
          location: { x: tree.x, y: tree.y },
          scale: tree.scale,
        });
        this.game.layerManager.layers.get('environmentLayer').add(treeToAdd);
      }
    }
  }

  /**
   * Renders a zone's tiles based on a config file
   */
  renderTiles () {
    if (this.config.TILES) {
      for (const [key, value] of this.config.TILES.entries()) {
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
  
}
