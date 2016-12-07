/**
 * Creates a new Zombie detection collider
 */

/**
 * Configuration of Zombie detection collider.
 * @type {Object}
 */
const config = {
  width: 500,
  height: 25
};

/**
 * Add sprite for detection
 */
export class ZombieDetector {
  constructor ({ game = {}, zombie = {} } = {}) {
    this.game = game;
    this.detectionTimer = this.game.time.now;
    this.zombie = zombie;
  }

  update () {

    this.game.layerManager.layers.get('playerLayer').forEach( (player) => {

      let line = -180;
      let ray;

      while ( line < 90 ) {
        if ( this.zombie.direction === 'left' ) {
          ray = new Phaser.Line(this.zombie.x, this.zombie.y - 75, this.zombie.x - this.zombie.perception, this.zombie.y + line);
          this.zombie.alerted = this.intersectionCheck(ray, player) ? true : false;
        } else {
          ray = new Phaser.Line(this.zombie.x, this.zombie.y - 75, this.zombie.x + this.zombie.perception, this.zombie.y + line);
          this.zombie.alerted = this.intersectionCheck(ray, player) ? true : false;
        }
        // this.game.debug.geom(ray);
        line = line + 15;
      }

    });

    this.dirty = true;
  }

  intersectionCheck (ray, player) {
    let intersection = false;
    if ( ray.intersects(player.detectionBounds.right) ||
          ray.intersects(player.detectionBounds.left) ||
          ray.intersects(player.detectionBounds.top) ||
          ray.intersects(player.detectionBounds.bottom) ) {
      this.detectionTimer = this.game.time.now + 300;
      intersection = true;
    }
    if ( this.detectionTimer > this.game.time.now ) {
      intersection = true;
    }
    return intersection;
  }

}
