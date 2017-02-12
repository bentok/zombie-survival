/**
 * DayCycle service
 */
export class DayCycle {
 
  /**
   * @param {Number} dayLength Length of day in milliseconds
   */
  constructor ({ game = {}, dayLength = 300000 } = {}) {
    this.game = game;
    this.dayLength = dayLength;
  }

  /**
   * Load sun
   * @param {Object} sprite Sun sprite
   */
  initSun (sprite) {
    this.sunSprite = sprite;
    this.sunset();
  }

  /**
   * Load moon
   * @param {Object} sprite Moon sprite
   */
  initMoon (sprite) {
    this.moonSprite = sprite;
    this.moonrise();
  }

  /**
   * Load shading
   * @param {Array} shades Shading range
   */
  initShading (shades) {
    this.shading = shades;
  }

  /**
   * Run sunrise animation, then sunset on complete
   * @param {Object} sprite Sun sprite
   */
  sunrise () {
    this.sunTween = this.game.add.tween(this.sunSprite.cameraOffset).to( { y: -250 }, this.dayLength, null, true);
    this.sunTween.onComplete.add(this.sunset, this);

    if (this.shading) {
      this.shading.forEach((shade) => {
        this.tweenTint(shade.sprite, shade.from, shade.to, this.dayLength);
      });
    }
  }

  /**
   * Run sunset animation, then sunrise on complete
   * @param {Object} sprite Sun sprite
   */
  sunset () {
    this.sunTween = this.game.add.tween(this.sunSprite.cameraOffset).to( { y: this.game.world.height + 400 }, this.dayLength, null, true);
    this.sunTween.onComplete.add(this.sunrise, this);

    if (this.shading) {
      this.shading.forEach((shade) => {
        this.tweenTint(shade.sprite, shade.to, shade.from, this.dayLength);
      });
    }
  }

  /**
   * Run moonrise animation, then moonset on complete
   * @param {Object} sprite Moon sprite
   */
  moonrise () {
    this.moonTween = this.game.add.tween(this.moonSprite.cameraOffset).to( { y: -350 }, this.dayLength, null, true);
    this.moonTween.onComplete.add(this.moonset, this);
  }

  /**
   * Run moonset animation, then moonrise on complete
   * @param {Object} sprite Moon sprite
   */
  moonset () {
    this.moonTween = this.game.add.tween(this.moonSprite.cameraOffset).to( { y: this.game.world.height + 400 }, this.dayLength, null, true);
    this.moonTween.onComplete.add(this.moonrise, this);
  }

  /**
   * Run through shading cycle as sun rises and sets
   * @param {Object} spriteToTween Sky sprite
   * @param {String} startColor Start color
   * @param {String} endColor End color
   * @param {Number} duration Duration in milliseconds
   */
  tweenTint (spriteToTween, startColor, endColor, duration) {
    const colorBlend = { step: 0 };

    this.game.add.tween(colorBlend).to({ step: 100 }, duration, Phaser.Easing.Default, false)
      .onUpdateCallback(() => {
        spriteToTween.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step, 1);
      })
      .start();
  }
 
}
