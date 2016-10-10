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
    self.collideGroup = self.game.add.group();
    self.crossGroup = self.game.add.group();
    layers.forEach((item, index) => {
      let key;
      let mapSpritesGroup = self.collideGroup;
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
        mapSpritesGroup = self.crossGroup;
      }
      const mapSprite = mapSpritesGroup.create(col * 20, row * 15, key);
      mapSprite.width = 20;
      mapSprite.height = 15;
      self.game.physics.enable(mapSprite, Phaser.Physics.ARCADE);
      mapSprite.body.immovable = true;
      mapSprite.id = index;
      self.mapSprites[index] = mapSprite;
    });
    return self;
  }

  checkCollideOverlap(sPlayer, gamersGroup) {
    const self = this;
    const weaponGroup = gamersGroup.children.map((other) => {
      return other.player.weapon.group;
    });
    self.game.physics.arcade.collide(sPlayer, self.collideGroup);
    self.game.physics.arcade.collide(
      self.collideGroup,
      weaponGroup,
      (sprite, bullet) => {
        bullet.kill();
        self.explosion.boom(sprite, 'brickKaboom');
        if (bullet.bullet.owner.id === sPlayer.player.id) {
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
