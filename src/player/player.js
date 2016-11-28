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
    this.config = {
      scale: 0.4,
    };
    this.anchor.setTo(0.5, 0);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.animations.add('run', [1, 2, 3, 4, 5], 13, true);
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
    } else if (this.keys.right.isDown) {
      this.direction = 'right';
      this.animations.play('run');
      if (this.scale.x === -this.config.scale) {
        this.scale.x = this.config.scale;
      }
    } else {
      this.animations.frame = 0;
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

}
