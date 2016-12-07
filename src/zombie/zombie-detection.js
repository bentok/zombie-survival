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
export class ZombieDetector extends Phaser.BitmapData {
  constructor ({ game = {}, zombie = {} } = {}) {
    super(game, 'detector raycast', window.innerWidth, window.innerHeight);
    this.game = game;
    this.context.fillStyle = 'rgb(255, 255, 255)';
    this.context.strokeStyle = 'rgb(255, 255, 255)';
    this.game.add.image(0, 0, this);
    this.detectionTimer = this.game.time.now;
  }

  update () {

    this.game.layerManager.layers.get('playerLayer').forEach( (player) => {
      this.game.layerManager.layers.get('enemyLayer').forEach( (enemy) => {

        let line = -180;
        let ray;

        while ( line < 90 ) {
          if ( enemy.direction === 'left' ) {
            ray = new Phaser.Line(enemy.x, enemy.y - 75, enemy.x - enemy.perception, enemy.y + line);
            enemy.alerted = this.intersectionCheck(ray, player) ? true : false;
          } else {
            ray = new Phaser.Line(enemy.x, enemy.y - 75, enemy.x + enemy.perception, enemy.y + line);
            enemy.alerted = this.intersectionCheck(ray, player) ? true : false;
          }
          this.game.debug.geom(ray);
          line = line + 15;
        }

      } );
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
