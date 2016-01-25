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
    
    this.move = new Move(this);
    
  }
  
  // Preload phase
  init() {
    // Load spritesheet - arguments(name, image path, width, height, number of frames in image)
    this.game.load.spritesheet('sprite', 'images/player-sprite-sheet.png', 81, 135, 14);
  }
  
  // Create phase
  render() {
    // Add sprite to render then add individual animations with indexes of animation frames
    this.sprite = this.game.add.sprite(game.world.width *0.5, game.world.height - 160, 'sprite');
    this.sprite.animations.add('idleRight', [12]);
    this.sprite.animations.add('idleLeft', [13]);
    this.sprite.animations.add('runRight', [0,1,2,3,4,5], 13, true);
    this.sprite.animations.add('runLeft', [6,7,8,9,10,11], 13, true);
    
    // Applies arcade physics to player, and collision with world bounds
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.checkWorldBounds = true;
    
    // Loads Phaser presets for arrow key input
    this.keys = this.game.input.keyboard.createCursorKeys();
  }
  
  // Update phase
  update() {
    var move = new Move(this);
    // Keyboard controls
    if (this.keys.left.isDown) {
      this.move.runLeft();
    } else if (this.keys.right.isDown) {
      this.move.runRight();
    } else if (this.direction === 'right') {
      this.move.idle();
    } else {
      this.move.idle();
    }
    
  }

  addHealth(amount){
    this.health = (this.health + amount <= this.maxHealth) ? this.health += amount : this.maxHealth;
  }

  subtractHealth(amount){
    this.health = (this.health - amount >= 0) ? this.health -= amount : 0;
  }

}
