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
    { x: 4000, y: window.innerHeight - 40, scale: 1.75 }
]);

/**
 * @type {Function} tileLocations Calls getTileMap to generate the tile map for the zone
 */
const tileLocations = getTileMap();

/**
 * @type {Map} TILES Each key represents a tile to render with a value of an array of objects which represent the settings of each tile
 */
export const TILES = new Map([
  [ 'grass', generateTiles({ tileName: 'grass-dark', config: tileLocations.grass }) ],
  [ 'dirt', generateTiles({ tileName: 'dirt-brown', config: tileLocations.dirt })]
]);

/**
 * @type {Object} CONFIG The entire configuration of environmental settings for Zone 1
 */
export const CONFIG = {
  WORLD_WIDTH,
  TREES,
  TILES,
};
