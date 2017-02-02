import { LayerManager } from '../layerManager/layerManager';
import { TreeSprite } from './tree.sprite';
import { TileSprite } from './tile.sprite';
import { SkySprite } from './sky.sprite';
import { MoonSprite } from './moon.sprite';
import { SunSprite } from './sun.sprite';
import { DayCycle } from './dayCycle.service';

/**
 * @class EnvironmentManager
 * 
 * Fires a series of methods to set up the environment unique to the parent state
 */

export class EnvironmentManager {
  /**
   * @param {Object} game Reference to the state's game object
   */
  constructor ({ game = {}, config = {} } = {}) {
    this.game = game;
    this.config = config;
    this.dayCycle = new DayCycle({ game });
    this.init();
  }

  /**
   * Run when the class is initialized
   */
  init () {
    this.renderTrees();
    this.renderTiles();
    this.renderSky();
  }

  /**
   * Sets up the trees based on the settings provided in a given zone's config object
   */
  renderTrees () {
    if (this.config.TREES) {
      for (const tree of this.config.TREES) {
        const treeToAdd = new TreeSprite({ 
          game: this.game,
          location: { x: tree.x, y: tree.y },
          scale: tree.scale,
        });
        this.game.layerManager.layers.get('environmentLayer').add(treeToAdd);
      }
    }
  }

  /**
   * Renders a zone's tiles based on a config file
   */
  renderTiles () {
    if (this.config.TILES) {
      for (const [key, value] of this.config.TILES.entries()) {
        for (const tile of value) {
          const tileToAdd = new TileSprite({ 
            game: this.game,
            location: { x: tile.x, y: tile.y },
            scale: tile.scale,
            tileName: tile.tileName,
          });
          this.game.layerManager.layers.get('environmentLayer').add(tileToAdd);
        }
      }
    }
  }

  /**
   * Renders sky and initializes sky events
   */
  renderSky () {
    this.skySprite = new SkySprite({ game: this.game, width: this.config.WORLD_WIDTH });
    this.game.layerManager.layers.get('skyLayer').add(this.skySprite);

    this.moonSprite = new MoonSprite({ 
      game: this.game, 
      location: { 
        x: this.game.width - this.game.width / 4,
        y: this.game.height + 500,
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.moonSprite);

    this.sunSprite = new SunSprite({
      game: this.game,
      location: {
        x: 50, 
        y: -250,
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.sunSprite);

    // Extendable array of sky shades for tweening
    const skyTones = [
        { sprite: this.skySprite, from: 0x1f2a27, to: 0x7ec0ee }
    ];

    // Init tweening of sky color, sun and moon
    this.dayCycle.initShading(skyTones);
    this.dayCycle.initSun(this.sunSprite);
    this.dayCycle.initMoon(this.moonSprite);
  }
  
}
