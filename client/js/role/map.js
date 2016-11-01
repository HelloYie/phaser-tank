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
    self.collideGroup = self.game.add.group(self.game.world, 'map collide group');
    self.crossGroup = self.game.add.group(self.game.world, 'map cross group');
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

  checkCollideOverlap(sPlayer, weaponsGroupList) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, self.collideGroup);
    const sprialWeaponsGroupList = [];
    const otherWeaponsGroupList = [];

    weaponsGroupList.forEach((weaponsGroup) => {
      const weaponKey = weaponsGroup.getFirstExists(false).key;
      if (weaponKey === 'bulletSprial') {
        sprialWeaponsGroupList.push(weaponsGroup);
      } else {
        otherWeaponsGroupList.push(weaponsGroup);
      }
    });
    // 转弯弹做 collide, 其余做 overlap
    self.game.physics.arcade.collide(
      self.collideGroup,
      sprialWeaponsGroupList,
      (sprite, sBullet) => {
        const angles = [0, 90, -90, -180];
        const rndAngle = angles[Math.floor(Math.random() * angles.length)];
        self.game.physics.arcade.velocityFromAngle(
          rndAngle,
          sBullet.bullet.speed,
          sBullet.body.velocity
        );
      },
      null,
      self,
    );
    self.game.physics.arcade.overlap(
      self.collideGroup,
      otherWeaponsGroupList,
      (sprite, sBullet) => {
        sBullet.bullet.power--;
        if (sBullet.bullet.power === 0) {
          sBullet.kill();
        }
        self.explosion.boom(sprite, 'brickKaboom');
        if (sprite.key === 'brick') {
          sprite.kill();
          sprite = null;
        }
      },
      null,
      self
    );
    return self;
  }
}
