import { game } from '../game';
import { Player } from '../player/player';
import { Sky } from './sky';
import { TestButtons } from '../test';
import { Zombie } from '../zombie/zombie';
import { LayerManager } from '../layerManager/layerManager';

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
    this.layerManager = new LayerManager();

    this.save();
  }

  setup () {
    this.sky.create();
    this.makeShelter();
    this.makeTable();
    this.makeGround();

    this.layerManager.setup();

    this.character.render();
    this.character.healthTimer.start();

    const gameTest = new TestButtons(this.character);
    gameTest.drawTestButtons();

    // Add Phisics to world and apply to all objects
    // this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // this.game.world.enableBody = true;

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

  }

  makeShelter () {
    const platformSprite = this.game.add.sprite(300, game.world.height - 300, 'shelter');
    this.game.platformLayer.add(platformSprite);

    // this.game.physics.enable(platformSprite, Phaser.Physics.ARCADE);
    //
    // platformSprite.body.gravity.y = 20000;
    // platformSprite.body.collideWorldBounds = true;
    // platformSprite.body.checkWorldBounds = true;
    // platformSprite.body.checkCollision.up = true;
    // platformSprite.body.checkCollision.right = false;
    // platformSprite.body.checkCollision.down = false;
    // platformSprite.body.checkCollision.left = false;
    // platformSprite.body.allowGravity = true;
    // platformSprite.body.moves = false;
    // platformSprite.body.immovable = false;
  }

  makeTable () {
    const tableSprite = this.game.add.sprite(200, game.world.height - 100, 'table');
    this.game.platformLayer.add(tableSprite);

    // this.game.physics.enable(tableSprite, Phaser.Physics.ARCADE);
    //
    // tableSprite.body.gravity.y = 20000;
    // tableSprite.body.collideWorldBounds = true;
    // tableSprite.body.checkWorldBounds = true;
    // tableSprite.body.checkCollision.up = true;
    // tableSprite.body.checkCollision.right = false;
    // tableSprite.body.checkCollision.down = false;
    // tableSprite.body.checkCollision.left = false;
    // tableSprite.body.allowGravity = true;
    // tableSprite.body.moves = false;
    // tableSprite.body.immovable = false;
  }

  addEnemy (params = {}) {
    const newEnemy = new Zombie(params);
    this.enemies.push(newEnemy);
    newEnemy.render();
  }


  update () {
    // for (const enemy of this.enemies) {
    //   this.game.physics.arcade.collide(enemy.sprite, this.sprite);
    //   this.game.physics.arcade.collide(enemy.sprite, this.character.sprite);
    //   enemy.update();
    //   for (const other of this.enemies) {
    //     this.game.physics.arcade.collide(enemy.sprite, other.sprite);
    //   }
    // }
    // this.game.physics.arcade.collide(this.character.sprite, this.sprite);
    // this.game.physics.arcade.collide(this.character.sprite, this.game.platformLayer);
    // this.game.physics.arcade.collide(this.sprite, this.game.platformLayer);
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
