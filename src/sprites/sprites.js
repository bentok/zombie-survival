import { game } from '../game';

export class Sprites {
  constructor () {
    this.game = game;
  }

  load () {
    // Load spritesheet - arguments(name, image path, width, height, number of frames in image)
    this.game.load.spritesheet('player', './dist/images/player-sprite-sheet.png', 81, 135, 14);
    this.game.load.spritesheet('zombie', './dist/images/zombie-sprite-sheet.png', 65.75, 134, 8);

  }

}
