/**
 * @summary
 *   道具类
 * @description
 *  + 武器: 普通子弹，激光子弹
 *  + 医疗: 可以加血
 *  + 无敌: 可以暂时无敌
 */


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
      case 'eqBulletBeam':
        player.weapon = player.beamHrzBullet;
        break;
      case 'eqBulletSprial':
        player.weapon = player.sprialBullet;
        break;
      default:
        break;
    }
    this.updateWeaponGroupList(player);
  }

  // 生成道具
  create(key, x, y) {
    const equipment = this.group.create(x, y, key);
    this.game.physics.enable(equipment, Phaser.Physics.ARCADE);
    equipment.width = 20;
    equipment.height = 15;
    // 装备出现 10s 后消失
    let timeout = 10 * 1000;
    const interval = setInterval(() => {
      timeout -= 1000;
      if (timeout === 0) {
        equipment.destroy();
        clearInterval(interval);
      }
    }, 1000);
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
