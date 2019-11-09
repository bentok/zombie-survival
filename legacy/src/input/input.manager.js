/**
 * Defines game inputs and methods in various classes on event listeners
 * @class Input manager
 */

export class InputManager extends Phaser.Input {

  /**
   * @param {Object} game Reference to Phaser game
   * @param {Class} player Reference to player
   */
  constructor ({ game = {}, player = {} } = {}) {
    super(game);
    this.player = player;
    this.keys = game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Default control values
    this.actions = {
      run: 'idle',
      jump: false
    };
    this.init();
  }

  init () {
    this.onKeyDown();
  } 

  /** 
   * Initializes listeners for keyboard input and executes the listener callbacks
   * Note: Listener callbacks are defined within the context of this method because the listener will
   * not accept a class method as a callback 
   */
  onKeyDown () {
    // Listen for direction key presses
    for (const key in this.keys) {
      if (this.keys.hasOwnProperty(key)) {
        /**
         * Arguments for the following functions
         * Phaser.Input.onDown.add(callback, context, priority, argument)
         */
        this.keys[key].onDown.add(broadcastAction, this, 0, { move: key });
        this.keys[key].onUp.add(broadcastAction, this, 0, { move: 'idle' });
      }
    }
    // Listen for jump button press
    this.jumpButton.onDown.add(broadcastAction, this, 0, { jump: true });
    this.jumpButton.onUp.add(broadcastAction, this, 0, { jump: false });

    /**
     * Fire action on relevant classes
     * @param {Object} event Phaser event
     * @param {String} values Values of actions to perform
     */
    function broadcastAction (event, { move = this.actions.move, jump = this.actions.jump } = {}) {
      this.actions.move = move;
      this.actions.jump = jump;
      this.player.sprite.setAction({ move: this.actions.move, jump: this.actions.jump });
    }
  }

  /**
   * Check if user can jump by looping over P2 bodies and trajectories
   * @returns {Boolean} result Whether or not the user can jump
   */
  checkIfCanJump () {
    const yAxis = p2.vec2.fromValues(0, 1);
    let result = false;
    for (const c of this.game.physics.p2.world.narrowphase.contactEquations) {
      if ( c.bodyA === this.player.sprite.body.data || c.bodyB === this.player.sprite.body.data) {
        let d = p2.vec2.dot(c.normalA, yAxis);
        if (c.bodyA === this.player.sprite.body.data) {
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
