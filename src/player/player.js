"use strict";

class Player{
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                      // I could pass the game object to the constructor.
    
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 25;
    this.healthTimer = new HealthTimer(this);
    this.direction = 'right';

    this.init();
    
  }
  
  // Preload phase
  init() {
    // Load spritesheet - arguments(name, image path, width, height, number of frames in image)
    this.game.load.spritesheet('playerSprite', 'images/player-sprite-sheet.png', 81, 135, 14);
  }
  
  // Create phase
  render() {
    // Add sprite to render then add individual animations with indexes of animation frames
    this.playerSprite = this.game.add.sprite(game.world.width *0.5, game.world.height - 160, 'playerSprite');
    this.playerSprite.animations.add('idleRight', [12]);
    this.playerSprite.animations.add('idleLeft', [13]);
    this.playerSprite.animations.add('runRight', [0,1,2,3,4,5], 13, true);
    this.playerSprite.animations.add('runLeft', [6,7,8,9,10,11], 13, true);
    
    // Applies arcade physics to player, and collision with world bounds
    this.game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.checkWorldBounds = true;
    
    // Loads Phaser presets for arrow key input
    this.keys = this.game.input.keyboard.createCursorKeys();
  }
  
  // Update phase
  update() {
    var movement = new Movement();
    // Keyboard controls
    if (this.keys.left.isDown) {
      if (this.keys.left.shiftKey) {
        // Example of passing in increased speed
        movement.moveLeft(this.playerSprite, 55, 'runLeft');
      } else {
        movement.moveLeft(this.playerSprite, this.speed, 'runLeft');
      }
      this.direction = 'left';
    } else if (this.keys.right.isDown) {
      movement.moveRight(this.playerSprite, this.speed, 'runRight');
      this.direction = 'right';
    } else if (this.direction === 'right') {
      movement.idle(this.playerSprite, this.speed, 'idleRight');
    } else {
      movement.idle(this.playerSprite, this.speed, 'idleLeft');
    }
    
  }

  addHealth(amount){
    this.health = (this.health + amount <= this.maxHealth) ? this.health += amount : this.maxHealth;
  }

  subtractHealth(amount){
    this.health = (this.health - amount >= 0) ? this.health -= amount : 0;
  }

}
