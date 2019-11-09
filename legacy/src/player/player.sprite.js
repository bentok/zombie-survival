/**
 * Player sprite is responsible for the visual aspects of the sprite such as laoding its image,
 * its physics body, animations, and its collision polygon
 *
 * TODO: Consider whether to separate body into a new file to abstract physics from the sprite file.
 *
 * @class PlayerSprite
 */
export class PlayerSprite extends Phaser.Sprite {

  /**
   * @param  {Object} game Reference to the state's game object
   */
  constructor ({ game = {}, speed = 25 } = {}) {
    super(game, 150, window.innerHeight - 170, 'player');
    this.config = {
      scale: 1,
      speed
    };
    this.jumpTimer = 0;
    this.actions = {};
    this.detectionBounds = {};
    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup () {
    this.body.fixedRotation = true;
    this.body.damping = 0.2;
    this.body.clearShapes();
    this.body.loadPolygon('player-polygon', 'player');
  }

  /**
   * Render the sprite body
   */
  render () {
    this.game.add.existing(this);
    this.animations.add('run', Phaser.Animation.generateFrameNames('run', 1, 5), 15, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('playerLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('playerLayer'), false, true);
    this.bodySetup();
  }

  /**
   * Sets actions for the sprite to perform. Executed from other managers such as InputListener
   */
  setAction ({ move = 'idle', jump = false } = {}) {
    this.actions.move = move;
    this.actions.jump = jump;
  }

  /**
   * Phaser's update lifecycle hook
   */
  update () {

    this.updateDetectionBounds();
    // Listen for move (direction) separately from jump so both can be executed simultaneously
    switch (this.actions.move) {
      case 'right':
        this.animations.play('run');
        if (this.scale.x === -this.config.scale) {
          this.scale.x = this.config.scale;
        }
        this.body.velocity.x = 15 * this.config.speed;
        break;
      case 'left':
        this.animations.play('run');
        if (this.scale.x === this.config.scale) {
          this.scale.x = -this.config.scale;
        }
        this.body.velocity.x = -15 * this.config.speed;
        break;
      case 'idle':
        this.frameName = 'idle';
        break;
      default:
        this.frameName = 'idle';
    }
    if (this.actions.jump && this.game.time.now > this.jumpTimer) {
      this.body.moveUp(375);
      this.jumpTimer = this.game.time.now + 750;
    }
  }

  updateDetectionBounds () {
    this.detectionBounds.top = new Phaser.Line(this.x - this.width / 2, this.y - this.height / 2, this.x + this.width / 2, this.y - this.height / 2);
    this.detectionBounds.bottom = new Phaser.Line(this.x - this.width / 2, this.y + this.height / 2, this.x + this.width / 2, this.y + this.height / 2);
    this.detectionBounds.right = new Phaser.Line(this.x + this.width / 2, this.y - this.height / 2, this.x + this.width / 2, this.y + this.height / 2);
    this.detectionBounds.left = new Phaser.Line(this.x - this.width / 2, this.y - this.height / 2, this.x - this.width / 2, this.y + this.height / 2);
  }

}
