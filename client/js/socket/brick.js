/**
 * 处理砖头事件
 */

export default {
  onKillBrick: function x(data) {
    const self = this;
    const killedBrick = self.gameMap.mapSprites[data.id];
    setTimeout(() => {
      self.explosion.boom(killedBrick, 'brickKaboom');
      killedBrick.kill();
    }, 100);
  },
};
