import { Zone1 } from './states/zone1';

const zone1 = new Zone1();

class Game extends Phaser.Game {

  constructor () {
    /**
     * Bootstraps the game and execute Phaser lifecycle hooks
     */
    super(window.innerWidth, window.innerHeight, Phaser.AUTO, '', null);
    this.state.add('Zone1', zone1, false);
    this.state.start('Zone1');
  }

}

export const game = new Game().game;


