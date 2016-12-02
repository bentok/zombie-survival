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
    this.distance = zombie.perception;
    this.context.fillStyle = 'rgb(255, 255, 255)';
    this.context.strokeStyle = 'rgb(255, 255, 255)';
    this.game.add.image(0, 0, this);
  }

  update () {
    this.context.clearRect(0, 0, this.game.width, this.game.height);

    this.game.layerManager.layers.get('playerLayer').forEach( (player) => {
      this.game.layerManager.layers.get('enemyLayer').forEach( (enemy) => {
        this.context.beginPath();
        this.context.moveTo(enemy.x, enemy.y - 90);
        if ( enemy.direction === 'left' ) {
          this.context.lineTo(enemy.x - this.distance, enemy.y - 90);
        } else {
          this.context.lineTo(enemy.x + this.distance, enemy.y - 90);
        }
        this.context.stroke();
      } );
    });

    this.dirty = true;
  }

}
