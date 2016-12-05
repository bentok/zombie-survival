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
    super(game, 150, window.innerHeight - 170, 'player');
    this.config = {
      scale: 1,
    };

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.direction = 'right';

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
   * Setup controls
   */
  controlsSetup () {
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.jumpTimer = 0;
  }

  /**
   * Render event in the Phaser cycle.
   */
  render () {
    this.game.add.existing(this);
    this.controlsSetup();
    this.animations.add('run', Phaser.Animation.generateFrameNames('run', 1, 5), 15, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('playerLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('playerLayer'), false, true);
    this.bodySetup();
  }

  /**
   * Update event in Phaser cycle
   */
  update () {
    if (this.keys.left.isDown) {
      this.direction = 'left';
      this.animations.play('run');
      if (this.scale.x === this.config.scale) {
        this.scale.x = -this.config.scale;
      }
      this.body.velocity.x = -15 * this.speed;
    } else if (this.keys.right.isDown) {
      this.direction = 'right';
      this.animations.play('run');
      if (this.scale.x === -this.config.scale) {
        this.scale.x = this.config.scale;
      }
      this.body.velocity.x = 15 * this.speed;
    } else {
      this.frameName = 'idle';
    }
    // TODO: Move jump to movement.js
    if (this.jumpButton.isDown && this.game.time.now > this.jumpTimer && this.checkIfCanJump()) {
      this.body.moveUp(375);
      this.jumpTimer = this.game.time.now + 750;
    }
  }

  checkIfCanJump () {
    const yAxis = p2.vec2.fromValues(0, 1);
    let result = false;
    for (let i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {

      const c = this.game.physics.p2.world.narrowphase.contactEquations[i];
      if ( c.bodyA === this. body.data || c.bodyB === this. body.data) {

        let d = p2.vec2.dot(c.normalA, yAxis);
        if (c.bodyA === this. body.data) {
          d *= -1;
        }
        if (d > 0.5) {
          result = true;
        }

      }

    }
    return result;
  }

}
