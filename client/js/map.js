/**
 * @summary
 *  地图类
 */

import tileMapJson from '../assets/tank/map.json';

export default class Map {
  constructor(game, explosion) {
    const self = this;
    self.game = game;
    self.explosion = explosion;
    self.init();
  }

  init() {
    const self = this;
    const layers = tileMapJson.layers[0].data;
    self.collideGroup = self.game.add.physicsGroup();
    self.crossGroup = self.game.add.physicsGroup();
    layers.forEach((item, index) => {
      let key;
      let physicsGroup = self.collideGroup;
      const row = Math.floor(index / 30);
      const col = index % 30;
      if (item === 0) {
        return;
      }
      if (item === 1) {
        key = 'brick';
      } else if (item === 2) {
        key = 'stone';
      } else if (item === 3) {
        key = 'gross';
        physicsGroup = self.crossGroup;
      }
      const mapSprite = physicsGroup.create(col * 20, row * 15, key);
      mapSprite.width = 20;
      mapSprite.height = 15;
      self.game.physics.enable(mapSprite, Phaser.Physics.ARCADE);
      mapSprite.body.immovable = true;
    });
    return self;
  }

  checkCollide(sPlayer) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, self.collideGroup);
    self.game.physics.arcade.overlap(
      self.collideGroup,
      sPlayer.player.bullets,
      (sprite, bullet) => {
        if (sprite.key === 'stone') {
          bullet.kill();
        } else if (sprite.key === 'brick') {
          self.explosion.boom(sprite, 'brickKaboom');
          bullet.kill();
          sprite.destroy();
        }
      },
      null,
      self
    );
    return self;
  }
}
