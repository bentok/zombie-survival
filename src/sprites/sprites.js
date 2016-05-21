"use strict";

import { game } from '../game';

export class Sprites {
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                      // I could pass the game object to the constructor.
  }

  load(){
    // Load spritesheet - arguments(name, image path, width, height, number of frames in image)
    this.game.load.spritesheet('player', 'images/player-sprite-sheet.png', 81, 135, 14);
    this.game.load.spritesheet('zombie', 'images/zombie-sprite-sheet.png', 66, 134, 8);

  }

}
