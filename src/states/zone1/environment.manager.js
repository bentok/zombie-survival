import { LayerManager } from '../../layerManager/layerManager';
import { TreeSprite } from '../../environment/tree.sprite';
import { TREES } from './zone1.config';

/**
 * @class EnvironmentManager
 * 
 * Fires a series of methods to set up the environment unique to the parent state
 */

export class EnvironmentManager {
  /**
   * @param {Object} game Reference to the state's game object
   */
  constructor ({ game = {} } = {}) {
    this.game = game;
    this.init();
  }

  /**
   * Run when the class is initialized
   */
  init () {
    this.generateTrees();
  }

  /**
   * Sets up the trees based on the settings provided in zone1.config.js
   */
  generateTrees () {
    for (const tree of TREES) {
      const treeToAdd = new TreeSprite({ 
        game: this.game,
        location: { x: tree.x, y: tree.y },
        scale: tree.scale,
      });
      this.game.layerManager.layers.get('environmentLayer').add(treeToAdd);
    }
  }
  
}
