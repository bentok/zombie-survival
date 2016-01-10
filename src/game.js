var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var character;
var graphics;
var healthBar;

function preload() {
}

function create() {

  game.stage.backgroundColor = '#2d2d2d';

  graphics = game.add.graphics(0,0);
  graphics.beginFill(0xE0042D);
  graphics.lineStyle(2, 0xFFFFFF, 0.8);
  healthBar = graphics.drawRect(10, 590, 780, 6);
  graphics.endFill();

  character = new Player();

  character.healthTimer.loop({increment:1000, action:updateCounter});
  character.healthTimer.timer.start();

}

function update() {
  healthBar.width = Math.floor((character.health / character.maxHealth) * 780);
}

function updateCounter(){
  character.health = character.health - 10;
  console.log(character.health, (character.health / character.maxHealth), healthBar.width);
  if(character.health <= 0){
    character.healthTimer.timer.stop();
  }
}

// function HealthTimer() {
//   this.timer = game.time.create(false);
//   this.loop = function(opts){
//     opts = (typeof opts == 'object') ? opts : {};
//     this.increment = opts.increment || 1000;
//     this.action = opts.action || function(){};
//     this.timer.loop(this.increment, this.action, this);
//   }
// }

// function Character(){
//   this.health = 100;
//   this.maxHealth = 100;
//   this.healthTimer = new HealthTimer();
// }
