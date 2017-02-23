import { Spawn } from '../services/spawn';
import { ZombieDetector } from './zombie-detection';

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
  constructor ({ game = {}, health = 100, maxHealth = 100, speed = 10, player = {}, perception = 300 } = {}) {
    super(game, spawn.location.x, spawn.location.y, 'zombie');

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.alerted = false;
    this.perception = perception;
    this.direction = 'left';
    this.player = player;
    this.config = {
      scale: 1
    };

    this.detector = {};

    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup () {
    this.body.fixedRotation = true;
    this.body.damping = 0.2;
    this.body.clearShapes();
    this.body.loadPolygon('zombie-polygon', 'zombie');
  }

    /**
   * Render on constructor instantiation
   */
  render () {
    this.game.add.existing(this);
    /**
     * Phaser provides a method to play all of the frames in a series of number frames. If there are six frames of "Run",
     * naming them Run1, Run2, etc will result in Phaser playing the full animation.
     * 
     * Phaser.Sprite.animations.add(name, generateFrameNames(frameNamePrefix, startNumber, endNumber), speed, loop)
     * name — Name to give the animation
     * frameNamePrefix — Name of frame in atlas without the number (e.g. Run1 would be "run")
     * startNumber — Starting frame number in a series of numbered frame names (e.g. Run1 would be "1")
     * endNumber — Ending frame number in a series of numbered frame names (e.g. Run6 would be "6")
     * speed - Framerate for animation
     * loop - If false, the animatino only plays once
     */
    this.animations.add('shamble', Phaser.Animation.generateFrameNames('shamble', 1, 2), 2, true);
    this.animations.add('lunge', Phaser.Animation.generateFrameNames('devour', 1, 4), 5, false);
    this.animations.add('devour', Phaser.Animation.generateFrameNames('devour', 5, 9), 5, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('enemyLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('enemyLayer'), false, true);
    this.bodySetup();

    this.game.debug.bodyInfo(this, 32, 32);
  }

  /**
   * Phaser's game loop
   */
  update () {
    if (this.contact && !this.dead) {
      this.onZombieGrab();
    }
    if (!this.contact) {
      this.onZombiePatrol();
    }
    // Run when zombie begins contact with a sprite
    this.body.onBeginContact.add(contact, this);
    function contact (body) {
      if ( body ) {
        if (body.sprite && body.sprite.key === 'player') {
          this.contact = true;
        }
      }
    }
  }

  onZombiePatrol () {
    this.detector.update();
    this.setPatrol();
    if ( this.alerted ) {
      this.perception = 400;
      this.speed = 60;
    } else {
      this.perception = 300;
      this.speed = 10;
    }
  }

  onZombieGrab () {
    const enemyLayer = this.game.layerManager.layers.get('enemyLayer');
    this.game.world.bringToTop(enemyLayer);
    this.animations.play('lunge');
    this.animations.currentAnim.onComplete.add(() => {
      // Bring zombie to top so we can see him devour P
      this.animations.play('devour');
    }, this);
    this.dead = true;
  }

  /**
   * Sets the partol behavior of a zombie
   */
  setPatrol () {
    if (this.alerted) {
      if (this.x > this.player.x) {
        this.shamble({ direction: 'left' });
        this.direction = 'left';
      } else {
        this.shamble({ direction: 'right' });
        this.direction = 'right';
      }
    } else {
      if (!this.behaviorDuration || this.behaviorDuration <= this.game.time.now) {
        // Set a duration for a new behavior
        this.behaviorDuration = this.game.time.now + 5000;
        // Stand when 0, walk when 1
        this.behavior = Math.round(Math.random());
        // Walk left when 0, walk right when 1
        this.direction = Math.round(Math.random()) === 0 ? 'left' : 'right';
      }
      if (this.behaviorDuration > this.game.time.now) {
        if (this.behavior === 1) {
          if (this.direction === 'left') {
            this.shamble({ direction: 'left' });
          } else {
            this.shamble({ direction: 'right' });
          }
        } else {
          this.frameName = 'idle';
        }
      }
    }
  }

  /**
   * Runs shamble animations
   * @param {String} direction Direction of animations
   * @param {Number} speedModifier Multiplier on zombie's default speed attribute
   */
  shamble ({ direction = 'left', speedModifier = 15 } = {}) {
    const velocity = direction === 'left' ? -this.speed : this.speed;
    const scale = direction === 'left' ? -this.config.scale : this.config.scale;
    this.animations.play('shamble');
    this.scale.x = scale;
    this.body.velocity.x = velocity;
  }

}
