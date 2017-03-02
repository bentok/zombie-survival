import { PlayerSprite } from './player.sprite';
import { HealthBarSprite } from '../healthBar/healthBar';
import { InputManager } from '../input/input.manager';
import { HealthTimer } from './healthTimer.service';

/**
 * Player manager is responsible for managing the state of the player and any aspects that are not
 * directly related to the body of the sprite such as user input and various stats and configuration
 * settings
 * 
 * @class PlayerManager
 */

export class PlayerManager {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Number} health Current player health
   * @param {Number} maxHealth Maximum health the player can have
   * @param {Number} speed Base speed modifier for the player
   * @param {String} direction The direction the player should be facing
   */
  constructor ({ game = {}, health = 100, maxHealth = 100, speed = 25, direction = 'right' } = {}) {
    this.state = {
      health,
      maxHealth,
      speed,
      direction
    };

    this.game = game;
    this.healthTimer = new HealthTimer({ player: this });
    this.inputManager = new InputManager({ game, player: this });
    this.sprite = new PlayerSprite({ game, speed });
    this.healthBar = new HealthBarSprite({ game, character: this });
    
    // TODO: add a new class to configure camera by extending Phaser.Camera
    this.game.camera.follow(this.sprite);
    this.game.camera.setBoundsToWorld();
  }

}
