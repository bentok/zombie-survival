import { ITextStyle, Scene, Text } from './lib';

const buttonRestStyle = {
  fill: '#FFFFFF',
};

const buttonHoverStyle = {
  fill: '#7CFC00',
};

const buttonActiveStyle = {
  fill: '#000000',
};

export class MenuButton extends Text {
  constructor(scene: Scene, x: number, y: number, text: string, onClick?: () => void) {
    super(scene, x, y, text, buttonRestStyle as ITextStyle);
    scene.add.existing(this);

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', this.enterMenuButtonHoverState)
      .on('pointerout', this.enterMenuButtonRestState)
      .on('pointerdown', this.enterMenuButtonActiveState)
      .on('pointerup', this.enterMenuButtonHoverState);

    if (onClick) {
      this.on('pointerup', onClick);
    }
  }

  private enterMenuButtonHoverState() {
    this.setStyle(buttonHoverStyle);
  }

  private enterMenuButtonRestState() {
    this.setStyle(buttonRestStyle);
  }

  private enterMenuButtonActiveState() {
    this.setStyle(buttonActiveStyle);
  }
}
