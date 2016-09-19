import { game } from '../game';
import { Player } from '../player/player';
import { TestButtons } from '../test';
import { Zombie } from '../zombie/zombie';

let world;

export class World {

  constructor ({ character = new Player() } = {}) {
    if (!world) {
      world = this;
    }
    this.game = game;
    this.level = 1;
    this.gravity = 200;

    this.enemies = [];
    this.character = character;

    this.save();

    return world;
  }

  setup () {
    this.setGravity(this.gravity);
    this.makeGround();
    this.makeSky();

    this.character.render();
    this.character.healthTimer.start();

    // this.addEnemy({ speed: 1 });
    // this.addEnemy({ speed: 2 });
    // this.addEnemy({ speed: 1.5 });

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
  
  makeSky () {
    const now = new Date();
    const hour = now.getHours();
    const sky = this.game.add.bitmapData(game.world.width, game.world.height - 30);
    const colors = [ 
      '#000000', '#0c1317', '#19262f', '#253947', '#324c5f', '#3f6077', 
      '#3f6077', '#4b738e', '#5886a6', '#6499be', '#71acd6', '#7ec0ee', 
      '#7ec0ee', '#71acd6', '#6499be', '#5886a6', '#4b738e', '#3f6077', 
      '#324c5f', '#324c5f', '#253947', '#19262f', '#0c1317', '#000000',
    ];

    sky.ctx.fillStyle = colors[hour];
    sky.ctx.beginPath();
    sky.ctx.rect(0, 0, game.world.width, game.world.height);
    sky.ctx.fill();
    
    this.sky = this.game.skyLayer.create(0, 0, sky);
  }

  addEnemy (params = {}) {
    const newEnemy = new Zombie(params);
    this.enemies.push(newEnemy);
    newEnemy.render();
  }


  update () {
    for (const enemy of this.enemies) {
      this.game.physics.arcade.collide(enemy.sprite, this.sprite, () => { }, null, this);
      this.game.physics.arcade.collide(enemy.sprite, this.character.sprite, () => { }, null, this);
      enemy.update();
      for (const other of this.enemies) {
        this.game.physics.arcade.collide(enemy.sprite, other.sprite, () => { }, null, this);
      }
    }
    this.game.physics.arcade.collide(this.character.sprite, this.sprite, () => { }, null, this);

    this.character.update();
  }


  save () {
    const player = this.character;
    const localStorage = window.localStorage;
    localStorage.setItem('player', JSON.stringify({ health: player.health, maxHealth: player.maxHealth, speed: player.speed, location: player.location }));
    console.log(player, localStorage);
  }

  load () {
    const player = JSON.parse(localStorage.player);
    this.character = Object.assign(this.character, player);
    this.character.location = this.character.currentLocation;
  }
}
