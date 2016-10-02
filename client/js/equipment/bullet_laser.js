/**
 * @summary
 *   激光弹类
 */
 import Equipment from './equipment';

 export default class BulletLaser extends Equipment {
   constructor(game, key, socket) {
     super(game, key, 0, 0, socket);
     this.x = 200;
     this.y = 500;
     this.create();
   }

   checkCollide(sPlayer) {
     const self = this;
     self.game.physics.arcade.overlap(
       sPlayer,
       self.equipmentBox,
       (sprite, box) => {
         box.kill();
         self.changeBullet(sprite.player, 'bulletLaser');
       },
       null,
       self
     );
   }
 }
