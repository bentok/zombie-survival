import { generateTiles } from '../utilities/tileGenerator';
import { getTileMap } from './tileMap.config';
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';

/**
 * Reduce state and return new state
 * @param {Object} state Current state
 * @param {Object} action Contains name of action and update to state
 * @returns {Object} New state
 */
function reducer (state = {}, action) {
  switch (action.type) {
    case 'WORLD_WIDTH':
      return Object.assign({}, state, {
        worldWidth: action.worldWidth
      });
    case 'TREES':
      return Object.assign({}, state, {
        trees: action.trees
      });
    case 'TILES':
      return Object.assign({}, state, {
        tiles: action.tiles
      });
    default: 
      return state;
  }
}

/**
 * @type {Function}
 * Redux store for dispatching to reducer and logging all state updates
 * This can be imported to eigther dispatch updates to the state or to get state with .getState()
 */
export const store = createStore(
  reducer,
  applyMiddleware(createLogger())
);

/**
 * @type {String} worldWidth Width of zone1's world container
 */
const worldWidth = 5000;
store.dispatch({
  type: 'WORLD_WIDTH',
  worldWidth,
});

/**
 * @type {Set} trees Manually set tree coordinates to allow for map creating.
 */
const trees = new Set([
    { x: 100, y: window.innerHeight - 40, scale: 1.1 },
    { x: 1000, y: window.innerHeight - 40, scale: 1.25 },
    { x: 2250, y: window.innerHeight - 40, scale: 1 },
    { x: 4000, y: window.innerHeight - 40, scale: 1.75 }
]);
store.dispatch({
  type: 'TREES',
  trees,
});

/**
 * @type {Function} tileLocations Calls getTileMap to generate the tile map for the zone
 */
const tileLocations = getTileMap();

/**
 * @type {Map} tiles Each key represents a tile to render with a value of an array of objects which represent the settings of each tile
 */
const tiles = new Map([
  [ 'grass', generateTiles({ tileName: 'grass-dark', config: tileLocations.grass }) ],
  [ 'dirt', generateTiles({ tileName: 'dirt-brown', config: tileLocations.dirt })]
]);
store.dispatch({
  type: 'TILES',
  tiles,
});
