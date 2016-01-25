"use strict";

class Player{
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                      // I could pass the game object to the constructor.
    
    // Load spritesheet - arguments(name, image path, width, height, number of frames in image)
    this.game.load.spritesheet('playerSprite', 'images/player-sprite-sheet.png', 81, 135, 14);
    this.health = 100;
    this.maxHealth = 100;
    this.healthTimer = new HealthTimer(this);
    // Defaults player to facing right
    this.direction = 'right';
    
  }
  
  render() {
    // Add sprite to render then add individual animations with indexes of animation frames
    this.playerSprite = this.game.add.sprite(game.world.width *0.5, game.world.height - 160, 'playerSprite');
    this.playerSprite.animations.add('idleRight', [12]);
    this.playerSprite.animations.add('idleLeft', [13]);
    this.playerSprite.animations.add('runRight', [0,1,2,3,4,5], 10, true);
    this.playerSprite.animations.add('runLeft', [6,7,8,9,10,11], 10, true);
    
    // Applies arcade physics to player, and collision with world bounds
    this.game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.checkWorldBounds = true;
    
    // Loads Phaser presets for arrow key input
    this.keys = this.game.input.keyboard.createCursorKeys();
  }
  
  update() {
    // Keyboard controls
    if (this.keys.left.isDown) {
      this.playerSprite.body.velocity.set(-250, 0);
      this.playerSprite.animations.play('runLeft');
      this.direction = 'left';
    } else if (this.keys.right.isDown) {
      this.playerSprite.body.velocity.set(250, 0);
      this.playerSprite.animations.play('runRight');
      this.direction = 'right';
    } else if (this.direction === 'right') {
      this.playerSprite.animations.play('idleRight');
      this.playerSprite.body.velocity.set(0, 0);
    } else {
      this.playerSprite.animations.play('idleLeft');
      this.playerSprite.body.velocity.set(0, 0);
    }
    
  }

  addHealth(amount){
    this.health = (this.health + amount <= this.maxHealth) ? this.health += amount : this.maxHealth;
  }

  subtractHealth(amount){
    this.health = (this.health - amount >= 0) ? this.health -= amount : 0;
  }

}
