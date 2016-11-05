// import { game } from '../game';
// import { HealthTimer } from './healthTimer';
// import { Move } from '../movement/movement';

/**
 * Player
 * @class Player
 */
export class Player {

  /**
   * @param  {Number} health Current health of the character
   * @param  {Number} maxHealth Maximum possible health for the character
   * @param  {Number} speed Walking speed for character
   */
  constructor ({ health = 100, maxHealth = 110, speed = 25 } = {}) {
    this.game = game;
    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.currentLocation = {
      x: 0,
      y: game.world.height - 170
    };
    this.healthTimer = new HealthTimer(this);
    this.direction = 'right';

    this.move = new Move(this);
  }

/**
 * Render event in the Phaser cycle.
 */
  render () {
    // Add sprite to render then add individual animations with indexes of animation frames
    // this.sprite = this.game.playerLayer.create(this.currentLocation.x, this.currentLocation.y, 'player');
    // Applies arcade physics to player, and collision with world bounds
    // this.game.physics.enable([this.sprite], Phaser.Physics.ARCADE);
    // this.sprite.body.collideWorldBounds = true;
    // this.sprite.checkWorldBounds = true;

    // Add animations
    // const idleRight = this.sprite.animations.add('idleRight', [12]);
    // const idleLeft = this.sprite.animations.add('idleLeft', [13]);
    // const runRight = this.sprite.animations.add('runRight', [0, 1, 2, 3, 4, 5], 13, true);
    // const runLeft = this.sprite.animations.add('runLeft', [6, 7, 8, 9, 10, 11], 13, true);
    // Register animations with move/anim controllers. (<function Name>, [animation, direction, moving])
    this.move.register('idleRight',   idleRight,  'right',  false);
    this.move.register('idleLeft',    idleLeft,   'left',   false);
    this.move.register('runRight',    runRight,   'right',  true);
    this.move.register('runLeft',     runLeft,    'left',   true);

    // Loads Phaser presets for arrow key input
    // this.keys = this.game.input.keyboard.createCursorKeys();
  }

  /**
   * Update event in Phaser cycle
   */
  update () {
    // Keyboard controls
    if (this.keys.left.isDown) {
      this.move.runLeft();
    } else if (this.keys.right.isDown) {
      this.move.runRight();
    } else {
      if (this.direction === 'left') {
        this.move.idleLeft();
      } else {
        this.move.idleRight();
      }
    }
  }
  /**
   * Add health to the characters current health.
   * @param {Number} amount The amount of health to add to the characters current health
   */
  addHealth (amount) {
    this.health = this.health + amount <= this.maxHealth ? this.health += amount : this.maxHealth;
  }
  /**
   * Subtract health from the characters current health.
   * @param  {Number} amount Amount of health to subtract from the character
   */
  subtractHealth (amount) {
    this.health = this.health - amount >= 0 ? this.health -= amount : 0;
  }

  doubleHealth () {
    this.health*=2;
  }
  /**
   * Set the location of the character.
   * @param  {Number} x The x scale for the location of the character
   * @param  {Number} y The y scale for the position of the character
   */
  set location ({ x = 0, y = 0 } = {}) {
    this.sprite.position.x = this.currentLocation.x = x;
    this.sprite.position.y = this.currentLocation.y = y;
  }
  /**
   * Get the location of the character.
   * @return {Object} {} X and Y coordinates of the character
   */
  get location () {
    if (this.sprite) {
      return {
        x: this.sprite.position.x,
        y: this.sprite.position.y,
      };
    }
  }

}
