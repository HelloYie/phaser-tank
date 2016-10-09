/**
 * 处理 boss 事件
 */

export default {
  onKillBoss: function x(data) {
    const self = this;
    const killedBoss = _.filter(
      [self.boss, self.enemiesBoss],
      (bs) => {
        return bs.camp === String(data.camp);
      }
    )[0];
    setTimeout(() => {
      killedBoss.sBoss.destroy();
      self.explosion.boom(killedBoss.sBoss, 'kaboom');
    }, 100);
  },
};
