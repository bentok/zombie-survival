import { game } from '../game';
import { Move } from '../movement/movement';

export class Zombie {

  constructor ({ speed = 2, health = 25 } = {}) {
    this.game = game;
    this.health = health;
    this.speed = speed;
    this.move = new Move(this);
  }

  render () {
    this.sprite = this.game.enemyLayer.create(this.game.world.width * 0.5 + 50, this.game.world.height - 170, 'zombie');
    // Add zombie graphic to physcics.
    game.physics.enable([ this.sprite ], Phaser.Physics.ARCADE);
    this.sprite.body.bounce.set(0.2);
    this.sprite.body.collideWorldBounds = true;

    // Add animations
    const idleRight = this.sprite.animations.add('idleRight', [2]);
    const idleLeft = this.sprite.animations.add('idleLeft', [4]);
    const runRight = this.sprite.animations.add('runRight', [0, 1, 2], 5, true);
    const runLeft = this.sprite.animations.add('runLeft', [4, 5, 6], 5, true);
    // Register animations with move/anim controllers. (<function Name>, [animation, direction, moving])
    this.move.register('idleRight',   idleRight,  'right',  false);
    this.move.register('idleLeft',    idleLeft,   'left',   false);
    this.move.register('runRight',    runRight,   'right',  true);
    this.move.register('runLeft',     runLeft,    'left',   true);
  }

  update () {
    this.move.runRight();
  }

}
