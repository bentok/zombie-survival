"use strict";

class Player{
  constructor(){
    this.game = game; // This is gathering the parent game object and relying on JS traversing.
                     // I could pass the game object to the constructor.
    this.game.load.image('playerSprite', 'images/ani1.png');
    this.health = 100;
    this.maxHealth = 100;
    this.healthTimer = new HealthTimer(this);
    
  }
  
  render() {
    this.playerSprite = this.game.add.sprite(game.world.width *0.5, game.world.height - 160, 'playerSprite');
    
    // Loads Phaser presets for arrow key input
    this.keys = this.game.input.keyboard.createCursorKeys();
  }
  
  keyboardInput() {
    if (this.keys.left.isDown) {
      this.playerSprite.position.x =  this.playerSprite.position.x - 5;
    }
    if (this.keys.right.isDown) {
      this.playerSprite.position.x = this.playerSprite.position.x + 5;
    }
  }

  addHealth(amount){
    this.health = (this.health + amount <= this.maxHealth) ? this.health += amount : this.maxHealth;
  }

  subtractHealth(amount){
    this.health = (this.health - amount >= 0) ? this.health -= amount : 0;
  }

}
