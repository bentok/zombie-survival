import { game } from '../game';
import { Player } from '../player/player';
import { Sky } from './sky';
import { TestButtons } from '../test';
import { Zombie } from '../zombie/zombie';

let world;

export class World {

  constructor ({ character = new Player() } = {}) {
    if (!world) {
      world = this;
    }
    this.game = game;
    this.sky = new Sky();
    this.level = 1;
    this.gravity = 200;

    this.enemies = [];
    this.character = character;

    this.save();

    return world;
  }

  setup () {
    this.setGravity(this.gravity);
    this.sky.create();
    this.makePlatform({
      width: 100,
      height: 100
    });
    this.makePlatform({
      width: 200,
      height: 200
    });
    this.makeGround();

    this.character.render();
    this.character.healthTimer.start();

    const gameTest = new TestButtons(this.character);
    gameTest.drawTestButtons();

  }

  setGravity (newGravity) {
    this.gravity = newGravity;
    this.game.physics.arcade.gravity.y = newGravity;
  }

  makeGround () {
    const ground = this.game.add.bitmapData(game.world.width, 40);
    ground.ctx.fillStyle = '#476A34';
    ground.ctx.beginPath();
    ground.ctx.rect(0, 20, game.world.width, 20);
    ground.ctx.fill();
    ground.ctx.fillStyle = '#687E5A';
    ground.ctx.beginPath();
    ground.ctx.rect(0, 0, game.world.width, 20);
    ground.ctx.fill();

    this.sprite = this.game.add.sprite(0, game.world.height - 35, ground);

    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

    this.sprite.body.allowGravity = false;
    this.sprite.body.immovable = true;
  }

  makePlatform ({ width = 100, height = 100 } = {}) {
    const platform = this.game.add.bitmapData(width, height);
    platform.ctx.fillStyle = '#4f2412';
    platform.ctx.beginPath();
    platform.ctx.rect(0, 0, width, height);
    platform.ctx.fill();

    const platformSprite = this.game.add.sprite(200 + width, game.world.height - height - 25, platform);
    this.game.platformLayer.add(platformSprite);

    this.game.physics.enable(platformSprite, Phaser.Physics.ARCADE);
    platformSprite.body.gravity.y = 20000;
    platformSprite.body.collideWorldBounds = true;
    platformSprite.body.checkWorldBounds = true;
    platformSprite.body.checkCollision.up = true;
    platformSprite.body.checkCollision.right = false;
    platformSprite.body.checkCollision.down = false;
    platformSprite.body.checkCollision.left = false;
    platformSprite.body.allowGravity = true;
    platformSprite.body.moves = false;
    platformSprite.body.immovable = false;
  }

  addEnemy (params = {}) {
    const newEnemy = new Zombie(params);
    this.enemies.push(newEnemy);
    newEnemy.render();
  }


  update () {
    for (const enemy of this.enemies) {
      this.game.physics.arcade.collide(enemy.sprite, this.sprite);
      this.game.physics.arcade.collide(enemy.sprite, this.character.sprite);
      enemy.update();
      for (const other of this.enemies) {
        this.game.physics.arcade.collide(enemy.sprite, other.sprite);
      }
    }
    this.game.physics.arcade.collide(this.character.sprite, this.sprite);
    this.game.physics.arcade.collide(this.character.sprite, this.game.platformLayer);
    this.game.physics.arcade.collide(this.sprite, this.game.platformLayer);
    this.character.update();
  }


  save () {
    const player = this.character;
    const localStorage = window.localStorage;
    localStorage.setItem('player', JSON.stringify({ health: player.health, maxHealth: player.maxHealth, speed: player.speed, location: player.location }));
  }

  load () {
    const player = JSON.parse(localStorage.player);
    this.character = Object.assign(this.character, player);
    this.character.location = this.character.currentLocation;
  }
}
