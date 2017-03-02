/**
 * @class HealthTimer
 * Reduces health over time
 */

export class HealthTimer {

  /**
   * @param {Object} player Player object
   */
  constructor ({ player = {} } = {}) {
    this.player = player;
    this.init();
  }

  /**
   * Starts an interval for gradual health reduction
   */
  init () {
    setInterval(() => {
      if (this.player.state.health >= 0) {
        this.player.state.health -= 1;
      }
    }, 10000);
  }
}
