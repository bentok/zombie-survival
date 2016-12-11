import { WORLD_WIDTH } from '../states/zone1.config';

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
      x: Math.random() * (WORLD_WIDTH - 0) + 0,
      y: window.innerHeight - 170
    };
  }

}
