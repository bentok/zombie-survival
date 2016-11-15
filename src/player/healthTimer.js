import { game } from '../game';

/**
 * Health timer creates a loop that constantantly decreases player's health. It calls health bar's
 * update function so health bar will continue to monitor health decreases from other events.
 */

export class HealthTimer {

  /**
   * @param {Class} player Any player with decreasing health over time
   */
  constructor ({ player = {} } = {}) {
    this.game = game;
    this.player = player;
    this.timer = this.game.time.create(false);
    this.healthLossIncrement = 0.1;
    this.increment = 100;
    /* Setup the update loop  */
    this.timer.loop(this.increment, this.updateCounter, this);
  }

  /**
   * Start the health timer
   * @returns {Object} Timer
   */
  start () {
    this.timer.start();
    return this.timer;
  }

  /**
   * Stop the health Bar timer.
   */
  stop () {
    this.timer.stop();
  }

  /**
   * Sets new health reduction increment.
   * @param {Number} newIncrement Increment to subtract from health
   */
  setIncrement (newIncrement) {
    this.healthLossIncrement = newIncrement;
  }

  /**
   * Decrease health by increment and call HealthBar's update function
   */
  updateCounter () {
    this.player.health = this.player.health - this.healthLossIncrement;
    this.player.healthBar.update();
    if (this.player.health <= 0) {
      this.stop();
    }
  }

}
