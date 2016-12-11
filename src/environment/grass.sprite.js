class GrassBitmap extends Phaser.BitmapData {
  constructor ({ game = {} } = {}) {
    super(game, 'grass', 2000, 40);
    this.ctx.fillStyle = '#476A34';
    this.ctx.beginPath();
    this.ctx.rect(0, 20, 2000, 20);
    this.ctx.fill();
    this.ctx.fillStyle = '#687E5A';
    this.ctx.beginPath();
    this.ctx.rect(0, 0, 2000, 20);
    this.ctx.fill();
  }
}

export class GrassSprite extends Phaser.Sprite {
  constructor ({ game = {} } = {}) {
    super(game, 0, game.world.height - 20, new GrassBitmap({ game }));
    game.add.existing(this);
    game.physics.p2.enable(this, false, true);
    this.body.kinematic = true;
    game.debug.spriteInfo(this, 32, 32);
  }
}
