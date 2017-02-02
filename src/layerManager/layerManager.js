/**
 * Layers added here will be Loaded by order of index.
 * @type {Array}
 */
const layerRegistry = [
  'sky',
  'environment',
  'land',
  'enemy',
  'player',
  'ui',
];

/**
 *  Manages the registering of groups and setting their render order
 *  @type {Class}
 */
export class LayerManager {
  constructor ({ game = {} } = {}) {
    this.game = game;
    this.layerRegistry = layerRegistry;
    this.layers = new Map();
  }

  /**
   * setup
   * Adds items in layerRegistry to the LayerManager's layers Map with post-fix 'Layer'
   * @example 'ui' will be added as 'uiLayer'
   */
  setup () {
    for ( const layer in this.layerRegistry ) {
      this.layers.set( `${layerRegistry[layer]}Layer`, this.game.add.group() );
      this.game.world.bringToTop(this.layers.get(`${layerRegistry[layer]}Layer`));
    }
  }

}
