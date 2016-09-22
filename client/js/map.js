/**
 * @summary
 *  地图类
 */

import tileMapJson from '../assets/tank/map.json';

export default class Map {
  constructor(game, key) {
    const self = this;
    self.game = game;
    self.key = key;
    self.init();
  }

  init() {
    const self = this;
    self.land = self.game.add.tileSprite(0, 0, 1200, 900, self.key);
    const layers = tileMapJson.layers[0].data;
    self.fsGroup = self.game.add.physicsGroup();
    layers.forEach((item, index) => {
      if (item === 0) {
        return;
      }
      let key;
      if (item === 1) {
        key = 'brick';
      } else if (item === 2) {
        key = 'stone';
      } else if (item === 3) {
        key = 'gross';
      }
      const row = Math.floor(index / 30);
      const col = index % 30;
      const mapSprite = self.fsGroup.create(col * 40, row * 30, key);
      self.game.physics.enable(mapSprite, Phaser.Physics.ARCADE);
      mapSprite.body.immovable = true;
    });
    return self;
  }

  checkCollide(sPlayer) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, self.fsGroup);
    self.game.physics.arcade.overlap(
      self.fsGroup,
      sPlayer.player.bullets,
      (sprite, bullet) => {
        if (sprite.key === 'stone' || sprite.key === 'brick') {
          bullet.kill();
        }
      },
      null,
      self
    );
    return self;
  }
}
