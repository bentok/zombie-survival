import { LayerManager } from '../layerManager/layerManager';
import { TreeSprite } from '../environment/tree.sprite';

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
    this.generateTrees();
  }

  /**
   * Sets up the trees based on the settings provided in a given zone's config object
   */
  generateTrees () {
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
  
}
