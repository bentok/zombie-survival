/**
 * Service for generating spawn points.
 * @class Spawn
 */
export class Spawn {

  constructor () {
    this.location = this.getSpawn();
  }

  getSpawn () {
    return {
      x: Math.random() * (window.innerWidth - 0) + 0,
      y: window.innerHeight - 170
    };
  }

}
