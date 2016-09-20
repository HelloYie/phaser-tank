
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 */


import utils from 'base_utils';
import RemotePlayer from './remote_player';
import TankGame from './game';

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
      'start game': self.onStartGame,
    };
    self.gameEvents = {
      disconnect: self.onSocketDisconnect,
      'new player': self.onNewPlayer,
      'move player': self.onMovePlayer,
      'remove player': self.onRemovePlayer,
      'kill player': self.onRemovePlayer,
      shot: self.onShot,
    };
    return self.init();
  }

  init() {
    const self = this;

    Object.keys(self.roomEvents).forEach((event) => {
      self.socket.on(event, self.roomEvents[event].bind(self));
    });
    return self;
  }

  initGame(game, player) {
    // 开始游戏时调用
    const self = this;
    self.game = game;
    self.player = player;
    self.sPlayer = player.sPlayer;

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

  onGameStart() {
    const self = this;
    Object.keys(self.gamers).forEach((gamerId) => {
      const gamer = self.gamers[gamerId];
      gamer.player.kill();
    });
    self.gamers = {};
    self.player.id = self.socket.id;
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
    if (duplicate || utils.plainId(data.id) === self.socket.id) {
      console.log('Duplicate player!');
      return;
    }
    const enemy = new RemotePlayer(
      data.id,
      self.game,
      data.x,
      data.y,
      data.name,
      data.camp,
      data.avatar
    );
    self.gamers[data.id] = enemy;
  }

  onMovePlayer(data) {
    const playerObj = this.gamerById(data.id);
    if (!playerObj) {
      return;
    }
    const movePlayer = playerObj.player;
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

  onLeaveRoom(data) {
    const plainId = utils.plainId(data.id);
    $(`.room_user#${plainId}`).remove();
  }

  onStartGame(data) {
    new TankGame(data.camp);
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
