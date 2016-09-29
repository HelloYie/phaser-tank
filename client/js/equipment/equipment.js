/**
 * @summary
 *   道具类
 * @description
 *  + 武器: 可以改变子弹
 *  + 医疗: 可以加血
 *  + 无敌: 可以暂时无敌
 */

 export default class Equipment {
   constructor(game, socket) {
     this.game = game;
     this.bulletKey = 'BulletLaser';
     this.socket = socket;
     this.create();
   }
   create() {
     this.eqBulletLaserBox = this.game.add.sprite(300, 500, 'eqBulletLaser');
     this.game.physics.enable(this.eqBulletLaserBox, Phaser.Physics.ARCADE);
     this.eqBulletLaserBox.width = 20;
     this.eqBulletLaserBox.height = 20;
   }

   // 改变武器的道具
   changeBullet(player, newKey) {
     const bullets = player.bullets;
     bullets.children.forEach((bullet) => {
       bullet.loadTexture(newKey);
     });
   }

   changeHealth() {

   }

   checkCollide(sPlayer) {
     const self = this;
     self.game.physics.arcade.overlap(
       sPlayer,
       self.eqBulletLaserBox,
       (sprite, box) => {
         box.kill();
         self.changeBullet(sprite.player, 'bulletLaser');
       },
       null,
       self
     );
   }
 }
