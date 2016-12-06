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
  constructor ({ game = {} } = {}) {
    super(game, 150, window.innerHeight - 170, 'player');
    this.config = {
      scale: 1,
    };

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
   * Plays run animation, sets the player's scale to face left, and moves the player left
   */
  runLeft ({ speed }) {
    this.animations.play('run');
    if (this.scale.x === this.config.scale) {
      this.scale.x = -this.config.scale;
    }
    this.body.velocity.x = -15 * speed;
  }

  /**
   * Plays run animation, sets the player's scale to face right, and moves the player right
   */
  runRight ({ speed }) {
    this.animations.play('run');
    if (this.scale.x === -this.config.scale) {
      this.scale.x = this.config.scale;
    }
    this.body.velocity.x = 15 * speed;
  }

  /**
   * Sets the player's animation from to the idle stance
   */
  idle () {
    this.frameName = 'idle';
  }

  /**
   * Initiates jump
   * TODO: Add jump animation
   */
  jump () {
    this.body.moveUp(375);
  }

  /**
   * Setup controls
   */
  controlsSetup () {
    this.jumpTimer = 0;
  }

}
