"use strict";

class Player{
  constructor({ health = 100, maxHealth = 100, speed = 25 } = {}){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                      // I could pass the game object to the constructor.

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.healthTimer = new HealthTimer(this);
    this.direction = 'right';

    this.move = new Move(this);
  }

  // Create phase
  render() {
    // Add sprite to render then add individual animations with indexes of animation frames
    this.sprite = this.game.playerLayer.create(this.game.world.width * 0.5, this.game.world.height - 170, 'player');
    // Applies arcade physics to player, and collision with world bounds
    this.game.physics.enable([this.sprite], Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.checkWorldBounds = true;

    //Add animations
    let idleRight = this.sprite.animations.add('idleRight', [12]);
    let idleLeft = this.sprite.animations.add('idleLeft', [13]);
    let runRight = this.sprite.animations.add('runRight', [0,1,2,3,4,5], 13, true);
    let runLeft = this.sprite.animations.add('runLeft', [6,7,8,9,10,11], 13, true);
    //Register animations with move/anim controllers. (<function Name>, [animation, direction, moving])
    this.move.register('idleRight',   idleRight,  'right',  false);
    this.move.register('idleLeft',    idleLeft,   'left',   false);
    this.move.register('runRight',    runRight,   'right',  true);
    this.move.register('runLeft',     runLeft,    'left',   true);

    // Loads Phaser presets for arrow key input
    this.keys = this.game.input.keyboard.createCursorKeys();
  }

  // Update phase
  update() {
    // Keyboard controls
    if (this.keys.left.isDown) {
      this.move.runLeft();
    } else if (this.keys.right.isDown) {
      this.move.runRight();
    } else {
      if(this.direction === 'left'){
        this.move.idleLeft();
      } else {
        this.move.idleRight();
      }
    }
  }

  addHealth(amount){
    this.health = (this.health + amount <= this.maxHealth) ? this.health += amount : this.maxHealth;
  }

  subtractHealth(amount){
    this.health = (this.health - amount >= 0) ? this.health -= amount : 0;
  }

}
