/**
 * @summary
 *   道具类
 * @description
 *  + 武器: 普通子弹，激光子弹
 *  + 医疗: 可以加血
 *  + 无敌: 可以暂时无敌
 */

import { BeamBulletWeapon, SprialBulletWeapon } from '../tool/bullet';


export default class Equipment {
  constructor(game, weaponsGroupList, socket) {
    this.game = game;
    this.socket = socket;
    this.weaponsGroupList = weaponsGroupList;
    this.group = this.game.add.group(this.game.world, 'equipment group');
  }

  updateWeaponGroupList(player) {
    // 换子弹后以前存放子弹的数组要更新
    this.weaponsGroupList.forEach((weaponGroup, index) => {
      const ownerId = weaponGroup.children[0].bullet.owner.id;
      if (player.id === ownerId) {
        this.weaponsGroupList[index] = player.weapon.group;
      }
    });
  }

  // 改变武器的道具
  changeBullet(player, key) {
    switch (key) {
      case 'eqBulletLaser':
        player.weapon = player.weapon.beamBullet || new BeamBulletWeapon(this.game);
        player.beamBullet = player.weapon;
        break;
      case 'eqBulletSprial':
        player.weapon = player.weapon.sprialBullet || new SprialBulletWeapon(this.game);
        player.sprialBullet = player.weapon;
        break;
      default:
        break;
    }
    player.weapon.setBullet(player);
    this.updateWeaponGroupList(player);
  }

  // 生成道具
  add(key, x, y) {
    const equipment = this.group.create(x, y, key);
    this.game.physics.enable(equipment, Phaser.Physics.ARCADE);
    equipment.width = 20;
    equipment.height = 15;
  }

  checkCollide(gamersGroup) {
    const self = this;
    self.game.physics.arcade.collide(
      gamersGroup,
      self.group,
      (sprite, box) => {
        box.kill();
        self.changeBullet(sprite.player, box.key);
      },
      null,
      self
    );
  }
}
