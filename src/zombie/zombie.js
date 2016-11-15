import { game } from '../game';
import { Move } from '../movement/movement';

/**
 * The Zombie Object
 * @class Zombie
 */

export class Zombie {

  /**
   * @param  {Number} speed  The speed the zombie moves.
   * @param  {Number} health  The total health the Zombie will have.
   */
  constructor ({ speed = 2, health = 25, character = {} } = {}) {
    this.game = game;
    this.health = health;
    this.speed = speed;
    this.move = new Move(this);
    this.character = character;
  }


  /**
   * Render the Zombie
   */
  render () {
    /*
      Add the Sprite to the Game object.
     */
    this.sprite = this.game.enemyLayer.create(this.game.world.width * 0.5 + 50, this.game.world.height - 170, 'zombie');

    const addedAnimations = this.addAnimations();
    /*
      Register animations with move/anim controllers. (<function Name>, [animation, direction, moving])
     */
    this.move.register('idleRight', addedAnimations.idleRight, 'right', false);
    this.move.register('idleLeft', addedAnimations.idleLeft, 'left', false);
    this.move.register('runRight', addedAnimations.runRight, 'right', true);
    this.move.register('runLeft', addedAnimations.runLeft, 'left', true);

  }

  /**
   * Adds animations.
   *
   * @return {Object} Returns registered animations.
   */
  addAnimations () {
    return {
      idleRight: this.sprite.animations.add('idleRight', [2]),
      idleLeft: this.sprite.animations.add('idleLeft', [4]),
      runRight: this.sprite.animations.add('runRight', [0, 1, 2, 3], 5, true),
      runLeft: this.sprite.animations.add('runLeft', [4, 5, 6, 7], 5, true)
    };
  }

  /**
   * Updates animation on Gameloop
   */
  update () {
    // TODO: Make this account for x position overlap when character is on a different y coordinate than zombies
    const walkTowardPlayer = this.character.sprite.body.x > this.sprite.body.x ? this.move.runRight : this.move.runLeft;
    walkTowardPlayer();
  }

}
