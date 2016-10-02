/**
 * @summary
 *   弹射弹类
 */
 import Equipment from './equipment';

 export default class BulletSprial extends Equipment {
   constructor(game, key, socket) {
     super(game, key, 0, 0, socket);
     this.x = 300;
     this.y = 500;
     this.bulletList = [];
     this.create();
   }

   checkCollide(sPlayer) {
     const self = this;
     self.game.physics.arcade.overlap(
       sPlayer,
       self.equipmentBox,
       (sprite, box) => {
         box.kill();
         self.changeBullet(sprite.player, 'bulletSprial');
       },
       null,
       self
     );
   }
 }
