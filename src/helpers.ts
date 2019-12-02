import { Scene } from './lib/scene.class';

export const getGameWidth = (scene: Scene) => {
  return scene.game.scale.width;
};

export const getGameHeight = (scene: Scene) => {
  return scene.game.scale.height;
};
