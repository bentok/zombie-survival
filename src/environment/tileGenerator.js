import { WORLD_WIDTH } from '../states/zone1/zone1.config';

/**
 * Generates the settings for rendering each light grass tile
 * @returns {Array} Array of settings for each individual tile
 */
export function generateTiles ({ tileName = '', config = {} } = {}) {
  // Default to a single layer at full world width
  config.range = config.range || new Map([ [1, [0, WORLD_WIDTH]] ]);
  const tiles = [];
  for (const [key, value] of config.range.entries()) {
    for (let i = value[0] / config.size; i < value[1] / config.size; i++) {
      tiles.push({
        x: config.size * i,
        y: window.innerHeight - config.size * config.yLevel,
        scale: 1,
        tileName,
      });
    }
  }
  return tiles;
}
