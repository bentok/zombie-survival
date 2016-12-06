import { PlayerManager } from '../player/player.manager';

export class InputManager extends Phaser.Input {

  constructor ({ game = {} } = {}) {
    super(game);
    // this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.keys = game.input.keyboard.createCursorKeys();
    this.onKeyDown();
  }

  onKeyDown () {
    const direction = 'right';
    this.keys[direction].onDown.add(() => {
      console.log(this.game);
    });
  }

  update () {
    if (this.keys.left.isDown) {
      // this.onPress.dispatch('hello');
      // this.player.state.direction = 'left';
      // this.player.sprite.runLeft({ speed: this.player.state.speed });
    } 
    // else if (this.keys.right.isDown) {
    //   this.player.state.direction = 'right';
    //   this.player.sprite.runRight({ speed: this.player.state.speed });
    // } else {
    //   this.player.sprite.idle();
    // }
    // if (this.jumpButton.isDown && this.game.time.now > this.jumpTimer && this.checkIfCanJump()) {
    //   this.player.sprite.jump();
    //   this.jumpTimer = this.game.time.now + 750;
    // }
  }

  /**
   * Check if user can jump by looping over P2 bodies and trajectories
   * @returns {Boolean} result Whether or not the user can jump
   */
  // checkIfCanJump () {
  //   const yAxis = p2.vec2.fromValues(0, 1);
  //   let result = false;
  //   for (const c of this.game.physics.p2.world.narrowphase.contactEquations) {
  //     if ( c.bodyA === this.sprite.body.data || c.bodyB === this.sprite.body.data) {
  //       let d = p2.vec2.dot(c.normalA, yAxis);
  //       if (c.bodyA === this.sprite.body.data) {
  //         d *= -1;
  //       }
  //       if (d > 0.5) {
  //         result = true;
  //       }
  //     }
  //   }
  //   return result;
  // }

}
