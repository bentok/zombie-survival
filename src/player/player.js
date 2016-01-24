"use strict";

class Player{
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                     // I could pass the game object to the constructor.
    this.game.load.image('playerSprite', 'images/ani1.png');
    this.health = 100;
    this.maxHealth = 100;
    this.healthTimer = new HealthTimer(this);
    
    // Load Player method to be called in "create" phase
    this.loadPlayer = () => {
      this.playerSprite = this.game.add.sprite(game.world.width *0.5, game.world.height - 160, 'playerSprite');
    }
    
    // Loads Phaser presets for arrow key input
    this.loadPlayerControls = () => {
      this.keys = this.game.input.keyboard.createCursorKeys();
    }
    
    // Runs in loop and listens for keypress. 
    // TODO: Movements themselves need to be in separate module
    this.keyboardInput = () => {
      if (character.keys.left.isDown) {
        this.playerSprite.position.x =  this.playerSprite.position.x - 5;
      }
      if (character.keys.right.isDown) {
        this.playerSprite.position.x = this.playerSprite.position.x + 5;
      }
    }
    
  }
}
