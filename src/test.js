import { World } from './world/world';

export class TestButtons {

  constructor ({ game = {}, character = {} } = {}) {
    this.game = game;
    this.character = character;
    this.world = new World({ game: this.game, character: this.character } = {});
  }

  /* Add button cheap constructor for test buttons in UI  */
  addButton (width, height, positionX, positionY, text, color, onClick) {
    const button = this.game.add.bitmapData(width, height);
    button.ctx.fillStyle = '#FFF';
    button.ctx.beginPath();
    button.ctx.rect(0, 0, width, height);
    button.ctx.fill();

    const style = { font: '12px Arial', fill: color, align: 'center' };
    const buttonText = game.make.text(0, 0, text, style);

    button.draw(buttonText, 20, 5, 25, 20);

    const newButton = game.add.button(positionX, positionY, button, onClick, this);
  }
/**
 * Add test buttons to the UI for testing.
 */
  drawTestButtons () {

    /* +10 Health button */
    {
      this.addButton(75, 25, 10, 10, '+ 10', '#009111', actionOnClick);

      function actionOnClick () {
        this.character.addHealth(10);
      }
    }

    /* -10 Health button */
    {
      this.addButton(75, 25, 95, 10, '- 10', '#AB1111', actionOnClick);

      function actionOnClick () {
        this.character.subtractHealth(10);
      }
    }

    /* save */
    {
      this.addButton(75, 25, 180, 10, 'Save', '#000', actionOnClick);

      function actionOnClick () {
        this.world.save();
      }
    }

    /* load */
    {
      this.addButton(75, 25, 265, 10, 'Load', '#000', actionOnClick);

      function actionOnClick () {
        this.world.load();
      }
    }

    /* +Enemy */
    {
      this.addButton(75, 25, 350, 10, '+enemy', '#000', actionOnClick);

      function actionOnClick () {
        this.world.addEnemy({ speed: 1.5, character: this.character });
      }
    }

  }

}
