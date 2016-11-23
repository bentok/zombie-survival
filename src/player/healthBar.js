import { game } from '../game';

/**
 *  Health Bar displays the ratio of player's health and maximum health any time it's update method is called.
 */

export class HealthBar {

  /**
   *  @param {Class} character The character Object parent of the Health Timer.
   */
  constructor ({ game = {}, character = {} } = {}) {
    this.game = game;
    this.character = character;

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

  }

  /**
   * Render the Health Bar
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
  }

  /**
   * Update the health bar
   */
  update () {
    this.game.add.tween(this.barSprite).to( { width: this.character.health / this.character.maxHealth * this.config.width }, this.config.animationDuration, Phaser.Easing.Linear.None, true);
  }

}
