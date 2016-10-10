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
  constructor(game, sPlayer, socket) {
    this.game = game;
    this.x = 500;
    this.y = 500;
    this.sPlayer = sPlayer;
    this.socket = socket;
    this.equipmentKeys = ['eqBulletLaser'];
    this.group = this.game.add.group();

    this.singleBullet = new SingleBulletWeapon(game, this.sPlayer.player);
    this.beamBullet = new BeamBulletWeapon(game, this.sPlayer.player);

    this.equipmentKeys.forEach((eqKey) => {
      const equipment = this.group.create(this.x, this.y, eqKey);
      this.game.physics.enable(equipment, Phaser.Physics.ARCADE);
      equipment.width = 20;
      equipment.height = 20;
    });
  }

 // 改变武器的道具
  changeBullet(player, newKey) {
    if (newKey === 'beam') {
      player.weapon = this.beamBullet;
    } else {
      player.weapon = this.singleBullet;
    }
  }

  changeHealth() {

  }

  checkCollide(sPlayer) {
    const self = this;
    self.game.physics.arcade.collide(
      sPlayer,
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
