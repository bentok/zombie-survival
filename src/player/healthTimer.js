import { game } from '../game';


/**
 *  Health Timer
 *  @class HealthTimer
 */

export class HealthTimer {

  /**
   *  @param {Player} player The player Object parent of the Health Timer.
   */
  constructor (player) {
    this.game = game;
    this.timer = this.game.time.create(false);
    this.player = player || {};

    /* Default visual configuration for the Health Bar */
    this.config = {
      width: window.innerWidth - 20,
      height: 12,
      x: 10,
      y: window.innerHeight - 20,
      bg: {
        color: '#404040'
      },
      bar: {
        color: '#AB1111'
      },
      animationDuration: 200
    };

    this.healthLossIncrement = 0.1;
    this.increment = 100;

    this.render();

    /* Setup the update loop  */
    this.timer.loop(this.increment, this.updateCounter, this);

  }

  /*
    Render the Health Bar
  */
  render () {
    /*  Draw the Health Bar background  */
    const back = this.game.add.bitmapData(this.config.width, this.config.height);
    back.ctx.fillStyle = this.config.bg.color;
    back.ctx.beginPath();
    back.ctx.rect(0, 0, this.config.width, this.config.height);
    back.ctx.fill();

    this.bgSprite = this.game.add.sprite(this.config.x, this.config.y, back);
    this.bgSprite.anchor.set(0);

    /* Draw the Health Bar  */
    const bar = this.game.add.bitmapData(this.config.width, this.config.height);
    bar.ctx.fillStyle = this.config.bar.color;
    bar.ctx.beginPath();
    bar.ctx.rect(0, 0, this.config.width - 10, this.config.height / 2);
    bar.ctx.fill();

    this.barSprite = this.game.add.sprite(this.config.x + 5, this.config.y + this.bgSprite.height / 4, bar);
    this.barSprite.anchor.set(0);

    /*  Set fixed camera  */
    this.bgSprite.fixedToCamera = true;
    this.barSprite.fixedToCamera = true;
  }

  /*
    Start the Health Bar timer
  */
  start () {
    this.timer.start();
    return this.timer;
  }

  /*
    Stop the Health Bar timer.
  */
  stop () {
    this.timer.stop();
  }

  /*
    Sets new health reduction increment.
  */
  setIncrement (newIncrement) {
    this.healthLossIncrement = newIncrement;
  }

  /*
    Update function for loop.
  */
  updateCounter () {
    this.player.health = this.player.health - this.healthLossIncrement;
    this.game.add.tween(this.barSprite).to( { width: this.player.health / this.player.maxHealth * this.config.width }, this.config.animationDuration, Phaser.Easing.Linear.None, true);
    if (this.player.health <= 0) {
      this.stop();
    }
  }

}
// end HealthTimer class
