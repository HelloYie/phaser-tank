/**
 * @summary
 *   道具类
 * @description
 *  + 武器: 可以改变子弹
 *  + 医疗: 可以加血
 *  + 无敌: 可以暂时无敌
 */

 export default class Equipment {
   constructor(game, key, x, y, socket) {
     this.game = game;
     this.key = key;
     this.x = x;
     this.y = y;
     this.socket = socket;
   }

   create() {
     this.equipmentBox = this.game.add.sprite(this.x, this.y, this.key);
     this.game.physics.enable(this.equipmentBox, Phaser.Physics.ARCADE);
     this.equipmentBox.width = 20;
     this.equipmentBox.height = 20;
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
 }
