import { generateTiles } from '../../environment/tileGenerator';
import { getTileMap } from './tileMap.config';

/**
 * @type {String} WORLD_WIDTH Width of zone1's world container
 */
export const WORLD_WIDTH = 5000;

/**
 * @type {Set} TREES Manually set tree coordinates to allow for map creating.
 */
export const TREES = new Set([
    { x: 100, y: window.innerHeight - 40, scale: 1.1 },
    { x: 1000, y: window.innerHeight - 40, scale: 1.25 },
    { x: 2250, y: window.innerHeight - 40, scale: 1 },
    { x: 4000, y: window.innerHeight - 72, scale: 1.75 }
]);

const tileLocations = getTileMap({ WORLD_WIDTH });

/**
 * @type {Map} TILES Each key represents a tile to render with a value of an array of objects which represent the settings of each tile
 */
export const TILES = new Map([
  [ 'grassLight', generateTiles({ tileName: 'grass-light', config: tileLocations.grassLight }) ],
  [ 'grassDark', generateTiles({ tileName: 'grass-dark', config: tileLocations.grassDark }) ],
  [ 'dirt', generateTiles({ tileName: 'dirt-brown', config: tileLocations.dirt })]
]);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Environment manager dynamically adds zones to map

/**
 * @type {Object} CONFIG The entire configuration of environmental settings for Zone 1
 */
export const CONFIG = {
  WORLD_WIDTH,
  TREES,
  TILES,
};
<<<<<<< HEAD
=======
>>>>>>> Adds environment manager to build a zone based on imported configs
=======
>>>>>>> Environment manager dynamically adds zones to map
