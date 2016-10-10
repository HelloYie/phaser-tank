/**
 * 处理砖头事件
 */

export default {
  onKillBrick: function x(data) {
    const self = this;
    const killedBrick = self.gameMap.mapSprites[data.id];
    const bulletOwner = self.gamerById(data.bulletOwnerId);
    bulletOwner.weapon.sBullet.kill();
    if (killedBrick.key !== 'brick') {
      return;
    }
    self.explosion.boom(killedBrick, 'brickKaboom');
    killedBrick.kill();
  },
};
