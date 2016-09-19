'use strict';

/**
 * 处理 socket 事件
 */

const util = require('util');
const io = require('socket.io');
const Player = require('./player');


class SocketHandler {
  constructor(server) {
    this.players = {};
    this.roomPlayers = {};
    this.socket = io.listen(server);
    this.socket.sockets.on('connection', (client) => {
      this.onSocketConnection.call(this, client);
    });
  }

  /**
   * @param id [String] 玩家id
   * @param silence [Boolean] 是否是静默的玩家
   * @return playerObj or false
   */
  playerById(id, silence) {
    const playerObj = this.players[id];
    if (playerObj) {
      return playerObj;
    }
    if (!silence) {
      util.log('Player not found: ', id);
    }
    return false;
  }

  /**
   * @param self [Object] SocketHandler 实例
   * @this [Object] Socket 实例;
   */
  onClientDisconnect(data) {
    const self = this.handler;
    util.log(`Player has disconnected: ${this.id}`);
    const removePlayer = self.playerById(this.id);

    if (!removePlayer) {
      return;
    }

    delete self.roomPlayers[this.roomId][this.id];
    delete self.players[this.id];
    this.to(this.roomId).emit('remove player', { id: this.id });
    this.leave(this.roomId);
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 创建玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onNewPlayer(data) {
    const self = this.handler;
    const client = this;
    const newPlayer = self.playerById(client.id);
    newPlayer.setAttrs(data);

    client.to(this.roomId).emit('new player', {
      id: newPlayer.id,
      x: newPlayer.x,
      y: newPlayer.y,
      name: newPlayer.name,
      camp: newPlayer.camp,
      avatar: newPlayer.avatar,
    });

    let existingPlayer;
    const roomPlayers = self.roomPlayers[this.roomId];
    Object.keys(roomPlayers).forEach((playerId) => {
      existingPlayer = roomPlayers[playerId];
      client.emit(
        'new player',
        {
          id: existingPlayer.id,
          x: existingPlayer.x,
          y: existingPlayer.y,
          name: existingPlayer.name,
          avatar: existingPlayer.avatar,
        }
      );
    });
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 移动玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onMovePlayer(data) {
    const self = this.handler;
    const movePlayer = self.playerById(this.id);

    if (!movePlayer) {
      return;
    }

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setAngle(data.angle);
    movePlayer.setSpeed(data.speed);

    this.to(this.roomId).emit('move player', {
      id: movePlayer.id,
      x: movePlayer.getX(),
      y: movePlayer.getY(),
      angle: movePlayer.getAngle(),
      speed: movePlayer.getSpeed(),
    });
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 移动玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onShot(data) {
    const self = this.handler;
    this.to(this.roomId).emit(
      'shot',
      {
        id: this.id,
      }
    );
  }

  onJoinRoom(data) {
    const self = this.handler;
    const client = this;
    const newPlayer = new Player({
      avatar: data.avatar,
      name: data.name,
      id: client.id,
      roomId: data.id,
    });
    client.roomId = data.id;
    // 加入socket 房间
    client.join(client.roomId);

    let existingPlayer;
    const roomPlayers = self.roomPlayers[client.roomId];
    if(roomPlayers) {
      Object.keys(roomPlayers).forEach((playerId) => {
        existingPlayer = roomPlayers[playerId];
        client.emit(
          'join room',
          {
            id: existingPlayer.id,
            name: existingPlayer.name,
            avatar: existingPlayer.avatar,
          }
        );
      });
    } else {
      self.roomPlayers[client.roomId] = {};
    }

    client.to(client.roomId).emit(
      'join room',
      {
        id: newPlayer.id,
        avatar: newPlayer.avatar,
        name: newPlayer.name,
      }
    );

    self.players[client.id] = newPlayer;
    self.roomPlayers[client.roomId][client.id] = newPlayer;
  }

  onStartGame() {
    const self = this.handler;
    const client = this;
    client.to(client.roomId).emit(
      'start game'
    );
    client.emit('start game');
  }

  /**
   * @summary 捕获 socket 事件
   * @param client: Socket 消息接收端
   */
  onSocketConnection(client) {
    const self = this;
    const events = {
      'disconnect': self.onClientDisconnect,
      'new player': self.onNewPlayer,
      'move player': self.onMovePlayer,
      'shot': self.onShot,
      'join room': self.onJoinRoom,
      'start game': self.onStartGame,
    };
    client.handler = self;

    util.log(`New player has connected: ${client.id}`);

    // bild event with client
    Object.keys(events).forEach((event) => {
      client.on(event, function(data){
        events[event].call(client, data);
      });
    });
  }
}

module.exports = (server) => {
  new SocketHandler(server);
};
