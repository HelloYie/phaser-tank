/**
 * 处理玩家事件
 */
import Player from '../role/player';


export default {
  // 别人加入游戏
  onNewPlayer: function x(data) {
    const self = this;
    console.log('New player connected:', data.id);
    const duplicate = self.gamerById(data.id, true);
    // 用户数据无效
    if (!data.x || !data.y || !data.camp) {
      console.log('not ready player!');
      return;
    }
    if (duplicate || data.id === self.socket.id) {
      console.log('Duplicate player!');
      return;
    }
    const other = new Player(
      data.id,
      self.game,
      'enemy',
      data.name,
      data.sex,
      data.camp,
      data.avatar,
      data.x,
      data.y,
      self.socket,
    );
    other.sPlayer.body.immovable = true;
    self.gamersGroup.add(other.sPlayer);
    self.gamers[data.id] = other;
  },

  onMovePlayer: function x(data) {
    const self = this;
    const movePlayer = self.gamerById(data.id);
    if (!movePlayer) {
      return;
    }
    const movesPlayer = movePlayer.sPlayer;
    movesPlayer.angle = data.angle;
    // TODO: 此处可以都用物理引擎, 但是会移动不同步，需要校准，故暂时不改
    if (data.id === self.socket.id) {
      this.game.physics.arcade.velocityFromAngle(
        data.angle,
        data.speed === 0 ? 0 : data.speed,
        movesPlayer.body.velocity
      );
    } else {
      movesPlayer.x = data.x;
      movesPlayer.y = data.y;
    }
    if (data.speed === 0) {
      movesPlayer.animations.play('stop');
    } else {
      movesPlayer.animations.play('move');
    }
  },

  onKillPlayer: function x(data) {
    const self = this;
    const killedId = data.id;
    const killedPlayer = self.gamerById(killedId);
    const killerId = data.killerId;
    const killer = self.gamerById(killerId);
    if (!killedPlayer) {
      return;
    }
    let health = data.health;
    health--;
    setTimeout(() => {
      if (health < 1) {
        self.explosion.boom(killedPlayer.sPlayer, 'kaboom');
        killedPlayer.sPlayer.destroy();
        delete self.gamers[killedId];
        if (self.kills[killerId] && self.kills[killerId].players.indexOf(killedPlayer) === -1) {
          self.kills[killerId].players.push(killedPlayer);
        } else {
          self.kills[killerId] = {
            name: killer.name,
            sex: killer.sex,
            avatar: killer.avatar,
            camp: killer.camp,
            players: [killedPlayer],
          };
        }
        self.room.checkGameEnd();
      } else {
        killedPlayer.setHealth(health);
      }
    }, 100);
  },

  onRemovePlayer: function x(data) {
    const self = this;
    const removePlayer = self.gamerById(data.id);
    if (!removePlayer) {
      console.info('no player to remove', data);
      return;
    }
    removePlayer.sPlayer.destroy();
    delete self.gamers[data.id];
    self.room.checkGameEnd();
  },

  onShot: function x(data) {
    const gamer = this.gamerById(data.id);
    if (!gamer) {
      return;
    }
    gamer.weapon.fire();
  },
};
