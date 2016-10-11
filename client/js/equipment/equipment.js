/**
 * @summary
 *   道具类
 * @description
 *  + 武器: 普通子弹，激光子弹
 *  + 医疗: 可以加血
 *  + 无敌: 可以暂时无敌
 */

import { SingleBulletWeapon, BeamBulletWeapon } from '../tool/bullet';


export default class Equipment {
  constructor(game, sPlayer, weaponsGroupList, socket) {
    this.game = game;
    this.sPlayer = sPlayer;
    this.socket = socket;
    this.weaponsGroupList = weaponsGroupList;
    this.group = this.game.add.group();
  }

  // 改变武器的道具
  changeBullet(player, newKey) {
    if (newKey === 'beam') {
      player.weapon = new BeamBulletWeapon(this.game, player);
    } else {
      player.weapon = new SingleBulletWeapon(this.game, player);
    }
    // 换子弹后以前存放子弹的数组要更新
    this.weaponsGroupList.forEach((weaponGroup, index) => {
      const ownerId = weaponGroup.children[0].bullet.owner.id;
      if (player.id === ownerId) {
        this.weaponsGroupList[index] = player.weapon.group;
      }
    });
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
        self.changeBullet(sprite.player, 'beam');
      },
      null,
      self
    );
  }
}
