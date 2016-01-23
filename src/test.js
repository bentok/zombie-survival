"use strict";

class TestButtons {

  constructor(character){
      this.game = game;
      this.character = character || {};
  }

  drawHealthButtons(){

    /* +10 Health button */
    ( () => {

      let button = this.game.add.bitmapData(75, 25);
      button.ctx.fillStyle = '#FFF';
      button.ctx.beginPath();
      button.ctx.rect(0, 0, 75, 25);
      button.ctx.fill();

      var addHealth = game.add.button(10, 10, button, actionOnClick, this);

      var style = { font: "12px Arial", fill: "#ff0044", align: "center" };
      var text = game.make.text(0,0, "+ 10", style);

      button.draw(text, 20, 5, 30, 20);

      function actionOnClick(){
        this.character.addHealth(10);
      }

    })();
  }

}
