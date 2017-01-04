export function getTileMap () {
  /**
   * @type {Map} location
   * location map should consist of a key and an object of settings
   * range is an array consisting of a start and end point for rendering tiles horizontally across the WORLD_WIDTH
   * yLevel the distance from the bottom of the page in units equal to the size fo the tile
   */
  return {
    grass: {
      size: 32,
      location: new Map([
        [ 'grass', { range: [0, 5000], yLevel: 1 } ]
      ])
    },
    dirt: {
      size: 32,
      location: new Map([
        [ 1, { range: [0, 5000], yLevel: 0 } ],
      ])
    }
  };
};
