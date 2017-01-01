import { WORLD_WIDTH } from '../states/zone1/zone1.config';

/**
 * Generates the settings for rendering each light grass tile
 * @param {String} tileName Name of the tile's reference in the atlas
 * @param {Object} config Config object specifying where to render the tiles in the world
 * @returns {Array} Array of settings for each individual tile
 */
export function generateTiles ({ tileName = '', config = {} } = {}) {
  const tiles = [];
  // Value is the location object on each entry
  for (const [key, value] of config.location.entries()) {
    // Draw tiles from the beginning until the end of the range at intervals equal to the size of the tile
    for (let i = value.range[0] / config.size; i < value.range[1] / config.size; i++) {
      tiles.push({
        x: config.size * i,
        y: window.innerHeight - config.size * value.yLevel,
        scale: 1,
        tileName,
      });
    }
  }
  return tiles;
}
