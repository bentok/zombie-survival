import { HealthBar } from './healthBar';
import { HealthTimer } from './HealthTimer';
import { Move } from '../movement/movement';

/**
 * Player
 * @class Player
 */
export class Player extends Phaser.Sprite {

  /**
   * @param  {Number} health Current health of the character
   * @param  {Number} maxHealth Maximum possible health for the character
   * @param  {Number} speed Walking speed for character
   */
  constructor ({ game = {}, health = 100, maxHealth = 100, speed = 25 } = {}) {
    super(game, 50, window.innerHeight - 170, 'player');
    this.anchor.setTo(0.5, 0);
    this.animations.add('run', [0, 1, 2, 3, 4, 5], 13, true);
    game.add.existing(this);

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.fallVelocity = 0;
    this.direction = 'right';
    
    this.controlsSetup();
    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup () {
    this.game.physics.enable([this], Phaser.Physics.ARCADE);
    this.body.gravity.y = 20000;
    this.body.bounce.y = 0.2;
    this.body.collideWorldBounds = true;
    this.checkWorldBounds = true;
  }

  /**
   * Setup controls
   */
  controlsSetup () {
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }

  /**
   * Render event in the Phaser cycle.
   */
  render () {
    this.bodySetup();
    this.healthBar = new HealthBar({ game: this.game, character: this });
    this.healthTimer = new HealthTimer({ game: this.game, player: this });
    // TODO: Convert HealthBar to extend Phaser.Sprite and remove this render call
    this.healthBar.render();
    this.healthTimer.start();
  }

  /**
   * Update event in Phaser cycle
   */
  update () {
    if (this.keys.left.isDown) {
      this.direction = 'left';
      this.animations.play('run');
      if (this.scale.x === 1) {
        this.scale.x = -1;
      }
    } else if (this.keys.right.isDown) {
      this.direction = 'right';
      this.animations.play('run');
      if (this.scale.x === -1) {
        this.scale.x = 1;
      }
    } else {
      this.animations.frame = 12;
    }
    
    if (this.jumpButton.isDown) {
      this.jumpTimer = this.game.time.now + 250;
    }
    if (this.jumpTimer > this.game.time.now) {
      // this.body.velocity.y -= 800;
    }
  }

  /**
   * Steadily increasing velocity downward.
   */
  falling () {
    this.fallVelocity += 10;
    this.body.velocity.y = this.fallVelocity;
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
  /**
   * Set the location of the character.
   * @param  {Number} x The x scale for the location of the character
   * @param  {Number} y The y scale for the position of the character
   */
  set location ({ x = 0, y = 0 } = {}) {
    this.position.x = this.currentLocation.x = x;
    this.position.y = this.currentLocation.y = y;
  }
  /**
   * Get the location of the character.
   * @return {Object} {} X and Y coordinates of the character
   */
  get location () {
    if (this.sprite) {
      return {
        x: this.position.x,
        y: this.position.y,
      };
    }
  }

}
