
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 */


import utils from 'base_utils';
import Player from './player';
import TankGame from './game';


export default class SocketEvent {
  /**
   * @param gamers 其他玩家
   */
  constructor(room, socket) {
    const self = this;
    self.socket = socket;
    self.gamers = {};
    self.kills = new Map();  // 击杀统计
    self.room = room;
    self.roomEvents = {
      connect: self.onSocketConnected,
      reconnect_failed: self.onSocketDisconnect,
      'join room': self.onJoinRoom,
      'remove player': self.onLeaveRoom,
      'loading progress': self.onLoadingProgress,
      matching: self.onMatching,
      'start game': self.onStartGame,
    };
    self.gameEvents = {
      disconnect: self.onSocketDisconnect,
      connect_error: self.onSocketDisconnect,
      'new player': self.onNewPlayer,
      'move player': self.onMovePlayer,
      'remove player': self.onRemovePlayer,
      'kill player': self.onKillPlayer,
      shot: self.onShot,
    };
    Object.keys(self.roomEvents).forEach((event) => {
      self.socket.on(event, self.roomEvents[event].bind(self));
    });
    return self;
  }

  // 开始游戏时调用
  initGame(game, player) {
    const self = this;
    self.game = game;
    self.player = player;
    self.sPlayer = player.sPlayer;
    // 自己加入游戏
    self.gamers[self.player.id] = self.player;

    // 解绑之前的所有事件
    Object.keys(self.roomEvents).forEach((event) => {
      self.socket.removeAllListeners(event);
    });

    Object.keys(self.gameEvents).forEach((event) => {
      self.socket.on(event, self.gameEvents[event].bind(self));
    });
    return self;
  }

  onSocketConnected() {
    const self = this;
    console.log('Connected to socket server');
    // 加入房间
    self.socket.emit('join room', {
      id: self.room.id,  // room id
      name: self.room.name,
      avatar: self.room.avatar,
      sex: self.room.sex,
    });
  }

  onSocketDisconnect() {
    const self = this;
    console.log('Disconnected from socket server');
    self.room.disconnect();
  }

  // 别人加入游戏
  onNewPlayer(data) {
    const self = this;
    console.log('New player connected:', data.id);
    const duplicate = self.gamerById(data.id, true);
    // 用户数据无效
    if (!data.x || !data.y || !data.camp) {
      console.log('not ready player!');
      return;
    }
    if (duplicate || utils.clientId(data.id) === self.socket.id) {
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
      'bullet',
      self.socket,
    );
    other.sPlayer.body.immovable = true;
    self.game.world.bringToTop(self.map.crossGroup);
    self.gamers[utils.clientId(data.id)] = other;
  }

  onMovePlayer(data) {
    const self = this;
    const player = self.gamerById(data.id);
    if (!player) {
      return;
    }
    const movePlayer = player.sPlayer;
    movePlayer.angle = data.angle;
    // TODO: 此处可以都用物理引擎, 但是会移动不同步，需要校准，故暂时不改
    if (utils.clientId(data.id) === this.socket.id) {
      this.game.physics.arcade.velocityFromAngle(
        data.angle,
        data.speed * 3,
        movePlayer.body.velocity
      );
    } else {
      movePlayer.x = data.x;
      movePlayer.y = data.y;
    }
    if (data.speed === 0) {
      movePlayer.animations.play('stop');
    } else {
      movePlayer.animations.play('move');
    }
  }

  onShot(data) {
    const gamer = this.gamerById(data.id);
    if (!gamer) {
      return;
    }
    gamer.weapon.fire();
  }

  onJoinRoom(data) {
    const self = this;
    self.room.otherJoined(data);
  }

  onLoadingProgress(data) {
    const self = this;
    self.room.progressGo(data.id, data.progress);
  }

  onMatching() {
    const self = this;
    self.room.matching();
  }

  onRemovePlayer(data) {
    const self = this;
    const removePlayer = self.gamerById(data.id);
    if (!removePlayer) {
      console.info('no player to remove', data);
      return;
    }
    removePlayer.sPlayer.destroy();
    delete self.gamers[data.id];
    self.room.checkGameEnd();
  }

  onKillPlayer(data) {
    const self = this;
    const killedId = utils.clientId(data.id);
    const killedPlayer = self.gamerById(killedId);
    const killerId = utils.clientId(data.killerId);
    const killer = self.gamerById(killerId);
    if (!killedPlayer) {
      return;
    }
    let health = data.health;
    health--;
    setTimeout(() => {
      if (health < 1) {
        self.explosion.boom(killedPlayer.sPlayer, 'kaboom');
        killedPlayer.sPlayer.destory();
        delete self.gamers[killedId];
        if (self.kills.has(killerId)) {
          self.kills.get(killerId).players.add(killedPlayer);
        } else {
          self.kills.set(
            killerId,
            {
              name: killer.name,
              sex: killer.sex,
              avatar: killer.avatar,
              camp: killer.camp,
              players: new Set([killedPlayer]),
            }
          );
        }
        self.room.checkGameEnd();
      } else {
        killedPlayer.setHealth(health);
      }
    }, 50);
  }

  onLeaveRoom(data) {
    const clientId = utils.clientId(data.id);
    $(`.room_user#${clientId}`).remove();
  }

  // 开始游戏
  onStartGame(data) {
    const self = this;
    self.room.id = data.roomId;
    self.room.camp = data.camp;
    new TankGame(data.camp, self.room, (o) => {
      self.explosion = o.explosion;
      self.map = o.map;
    });
  }

  gamerById(id, silence = false) {
    const self = this;
    const gamer = self.gamers[utils.clientId(id)];
    if (gamer) {
      return gamer;
    }
    if (!silence) {
      console.log('Player not found: ', id);
    }
    return false;
  }
}
