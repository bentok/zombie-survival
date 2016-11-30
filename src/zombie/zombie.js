import { Spawn } from '../services/spawn';

/**
 * Spawn point coordinates
 * @type {Object}
 */
const spawn = new Spawn();

/**
 * Zombie
 * @class Zombie
 */
export class Zombie extends Phaser.Sprite {

  /**
   * @param  {Number} health Current health of the zombie
   * @param  {Number} maxHealth Maximum possible health for the zombie
   * @param  {Number} speed Walking speed for zombie
   * @property {Boolean} alerted Toggles whether the zombie moves toward the player
   */
  constructor ({ game = {}, health = 100, maxHealth = 100, speed = 10, player = {} } = {}) {
    super(game, spawn.location.x, spawn.location.y, 'zombie');
    this.player = player;
    this.config = {
      scale: 0.4,
    };

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.alerted = false;

    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup () {
    this.body.fixedRotation = true;
    this.body.damping = 0.2;
  }

  /**
   * Render on constructor instantiation
   */
  render () {
    this.game.add.existing(this);
    this.animations.add('shamble', [1, 2, 2], 2, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('enemyLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('enemyLayer'), false, true);
    this.bodySetup();
  }

  /**
   * Phaser's game loop
   */
  update () {
    this.setPatrol();
  }
  
  /**
   * Sets the partol behavior of a zombie
   */
  setPatrol () {
    if (Math.abs(this.x - this.player.x) < 300) {
      this.alerted = true;
    } 
    
    if (this.alerted) {
      if (this.x > this.player.x) {
        this.animations.play('shamble');
        this.scale.x = -this.config.scale;
        this.body.velocity.x = -15 * this.speed;
      } else {
        this.animations.play('shamble');
        this.scale.x = this.config.scale;
        this.body.velocity.x = 15 * this.speed;
      }
    } else {
      this.animations.frame = 0;
    }
  }

}
