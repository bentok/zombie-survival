import { Zone1 } from './states/zone1/zone1';

const zone1 = new Zone1();

class Game extends Phaser.Game {

  constructor () {
    super(window.innerWidth, window.innerHeight, Phaser.AUTO, '', null);
    this.state.add('Zone1', zone1, false);
    this.state.start('Zone1');
  }
  
}

const game = new Game();
