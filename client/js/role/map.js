/**
 * @summary
 *  地图类
 */

import tileMapJson from '../../assets/tank/map.json';

export default class Map {
  constructor(game, explosion, socket) {
    const self = this;
    self.game = game;
    self.explosion = explosion;
    self.socket = socket;
    self.mapSprites = [];
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
      mapSprite.id = index;
      self.mapSprites[index] = mapSprite;
    });
    return self;
  }

  checkCollideOverlap(sPlayer) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, self.collideGroup);
    self.game.physics.arcade.overlap(
      self.collideGroup,
      sPlayer.player.bullets,
      (sprite, bullet) => {
        // TODO: 转弯弹
        if (bullet.key === 'bulletSprial') {
          const vX = bullet.body.velocity.x;
          const vY = bullet.body.velocity.y;
          bullet.body.velocity.set(vY, vX);
        }
        if (sprite.key === 'stone') {
          bullet.kill();
        } else if (sprite.key === 'brick') {
          bullet.kill();
          self.socket.emit('kill brick', {
            id: sprite.id,
          });
        }
      },
      null,
      self
    );
    return self;
  }
}
