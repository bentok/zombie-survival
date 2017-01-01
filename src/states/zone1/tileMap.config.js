export function getTileMap ({ WORLD_WIDTH }) {
  /**
   * @type {Map} location
   * location map should consist of a key and an object of settings
   * range is an array consisting of a start and end point for rendering tiles horizontally across the WORLD_WIDTH
   * yLevel the distance from the bottom of the page in units equal to the size fo the tile
   */
  return {
    grassLight: {
      size: 32,
      location: new Map([
        [ 1, { range: [0, WORLD_WIDTH / 5], yLevel: 2 } ],
        [ 2, { range: [WORLD_WIDTH / 2, WORLD_WIDTH], yLevel: 2 } ]
      ])
    },
    grassDark: {
      size: 32,
      location: new Map([
        [ 1, { range: [0, WORLD_WIDTH], yLevel: 1 } ]
      ])
    },
    dirt: {
      size: 32,
      location: new Map([
        [ 1, { range: [0, WORLD_WIDTH], yLevel: 0 } ],
        [ 2, { range: [0, WORLD_WIDTH / 8], yLevel: 10 } ],
        [ 3, { range: [WORLD_WIDTH / 6, WORLD_WIDTH / 4], yLevel: 10 } ],
        [ 4, { range: [WORLD_WIDTH / 2, WORLD_WIDTH / 1.6], yLevel: 10 } ]
      ])
    }
  };
};
