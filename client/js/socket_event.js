
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 */


import utils from 'base_utils';
import RemotePlayer from './remote_player';
import Explosion from './explosion';
import TankGame from './game';
import Attack from './attack';

export default class SocketEvent {
  /**
   * @param gamers 其他玩家
   */
  constructor(room, socket) {
    const self = this;
    self.socket = socket;
    self.gamers = {};
    self.room = room;
    self.roomEvents = {
      connect: self.onSocketConnected,
      'join room': self.onJoinRoom,
      'remove player': self.onLeaveRoom,
      'loading progress': self.onLoadingProgress,
      'start game': self.onStartGame,
    };
    self.gameEvents = {
      disconnect: self.onSocketDisconnect,
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
    self.gamers[utils.createSocketId(self.player.id)] = self.player;

    // 解绑之前的所有事件
    Object.keys(self.roomEvents).forEach((event) => {
      self.socket.removeListener(event, self.roomEvents[event]);
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
    console.log('Disconnected from socket server');
  }

  // 自己和别人加入游戏
  onNewPlayer(data) {
    const self = this;
    console.log('New player connected:', data.id);

    const duplicate = self.gamerById(data.id, true);
    // 用户数据无效
    if (!data.x || !data.y || !data.camp) {
      return;
    }
    if (duplicate || utils.clientId(data.id) === self.socket.id) {
      console.log('Duplicate player!');
      return;
    }
    const enemy = new RemotePlayer(
      data.id,
      self.game,
      'enemy',
      data.name,
      data.camp,
      data.avatar,
      data.x,
      data.y,
      'bullet',
      self.socket,
    );
    self.gamers[data.id] = enemy;
  }

  onMovePlayer(data) {
    const player = this.gamerById(data.id);
    if (!player) {
      return;
    }
    const movePlayer = player.sPlayer;
    movePlayer.x = data.x;
    movePlayer.y = data.y;
    movePlayer.angle = data.angle;
    movePlayer.animations.play('move');
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

  onRemovePlayer(data) {
    console.info('要打死', data);
    const self = this;
    const removePlayer = self.gamerById(data.id);
    if (!removePlayer) {
      return;
    }
    removePlayer.player.kill();
    delete self.gamers[data.id];
  }

  onKillPlayer(data) {
    const self = this;
    const killedPlayer = self.gamerById(data.id);
    if (!killedPlayer) {
      return;
    }
    self.explosion.boom(killedPlayer.sPlayer);
    setTimeout(() => {
      killedPlayer.sPlayer.kill();
      delete self.gamers[data.id];
    }, 50);
  }

  onLeaveRoom(data) {
    const clientId = utils.clientId(data.id);
    $(`.room_user#${clientId}`).remove();
  }

  // 开始游戏
  onStartGame(data) {
    const self = this;
    new TankGame(data.camp, self.room, (o) => {
      // 初始化爆炸类
      self.explosion = new Explosion(o.game, 'kaboom');
      // 初始化攻击类
      new Attack(o.game, self.socket);
    });
  }

  gamerById(id, silence = false) {
    const self = this;
    const gamer = self.gamers[id];
    if (gamer) {
      return gamer;
    }
    if (!silence) {
      console.log('Player not found: ', id);
    }
    return false;
  }
}
