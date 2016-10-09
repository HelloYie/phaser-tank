/**
 * 处理砖头事件
 */

export default {
  onKillBrick: function x(data) {
    const self = this;
    const killedBrick = self.gameMap.mapSprites[data.id];
    if (killedBrick.key !== 'brick') {
      return;
    }
    setTimeout(() => {
      killedBrick.kill();
    }, 100);
  },
};
