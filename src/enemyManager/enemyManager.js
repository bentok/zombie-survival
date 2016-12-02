import { Zombie } from '../zombie/zombie';
import { ZombieDetector } from '../zombie/zombie-detection';

/**
 *  Manages the Enemies
 *  @type {Class}
 */
export class EnemyManager {
  constructor ({ game = {} } = {}) {
    this.game = game;
    this.zombies = [];
  }

  addZombie ( { player = {} } ) {
    const zombie = new Zombie({ game: this.game, speed: 1, player });
    zombie.detector = new ZombieDetector( { game: this.game, zombie } );
    this.zombies.push( zombie );
  }
}
