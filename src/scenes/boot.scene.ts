import { ISettingsConfig, Scene } from '../lib';

const sceneConfig: ISettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot',
};

/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Scene {
  constructor() {
    super(sceneConfig);
  }

  private getGameWidth = () => {
    return this.game.scale.width;
  }

  private getGameHeight = () => {
    return this.game.scale.height;
  }

  preload() {
    const halfWidth = this.getGameWidth() * 0.5;
    const halfHeight = this.getGameHeight() * 0.5;

    const progressBarHeight = 100;
    const progressBarWidth = 400;

    const progressBarContainer = this.add.rectangle(
      halfWidth,
      halfHeight,
      progressBarWidth,
      progressBarHeight,
      0x000000,
    );
    const progressBar = this.add.rectangle(
      halfWidth + 20 - progressBarContainer.width * 0.5,
      halfHeight,
      10,
      progressBarHeight - 20, 0x888888,
    );

    const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...')
      .setFontSize(24);
    const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
    const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

    this.load.on('progress', (value: any) => {
      progressBar.width = (progressBarWidth - 30) * value;

      const percent = value * 100;
      percentText.setText(`${percent}%`);
    });

    this.load.on('fileprogress', (file: any) => {
      assetText.setText(file.key);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      progressBar.destroy();
      progressBarContainer.destroy();

      this.scene.start('MainMenu');
    });

    this.loadAssets();
  }

  /**
   * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
   * should be added to this method. Once loaded in, the loader will keep track of them, indepedent
   * of which scene is currently active, so they can be accessed anywhere.
   */
  private loadAssets() {
    // Load sample assets
    // Replace with real assets
    this.load.image('ground', 'assets/backgrounds/hills-layer-5.png');
    this.load.image('zombie', 'assets/enemies/zombie.png');
  }
}
