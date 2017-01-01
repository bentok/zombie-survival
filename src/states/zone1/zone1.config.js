import { generateTiles } from '../../environment/tileGenerator';

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

const grassLightConfig = {
  size: 32,
  yLevel: 2,
  range: new Map([
    [ 1, [0, WORLD_WIDTH / 5] ],
    [ 2, [WORLD_WIDTH / 2, WORLD_WIDTH] ]
  ])
};

const grassDarkConfig = {
  size: 32,
  yLevel: 1,
};

const dirtConfig = {
  size: 32,
  yLevel: 0,
};

/**
 * @type {Map} TILES Each key represents a tile to render with a value of an array of settings
 */
export const TILES = new Map([
  [ 'grassLight', generateTiles({ tileName: 'grass-light', config: grassLightConfig }) ],
  [ 'grassDark', generateTiles({ tileName: 'grass-dark', config: grassDarkConfig }) ],
  [ 'dirt', generateTiles({ tileName: 'dirt-brown', config: dirtConfig })]
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
