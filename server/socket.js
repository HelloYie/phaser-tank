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
   * @param data [Object] 被kill后返回的数据
   */
  onKill(self, data) {
    const removePlayer = self.playerById(data.id);
    // Player not found
    if (!removePlayer) {
      return;
    }
    // removePlayer.player.kill();
    console.log(removePlayer);
    // Remove player from array
    delete self.players[data.id];
    this.broadcast.emit('kill', { id: data.id });
  }

  /**
   * @param self [Object] SocketHandler 实例
   * @this [Object] Socket 实例
   */
  onClientDisconnect(self) {
    util.log(`Player has disconnected: ${this.id}`);

    const removePlayer = self.playerById(this.id);

    if (!removePlayer) {
      return;
    }
    delete self.players[this.id];

    this.broadcast.emit('remove player', { id: this.id });
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 创建玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onNewPlayer(self, data) {
    const it = this;
    const newPlayer = new Player(data.x, data.y, data.angle, data.name);
    newPlayer.id = this.id;

    it.broadcast.emit('new player', {
      id: newPlayer.id,
      x: newPlayer.getX(),
      y: newPlayer.getY(),
      name: newPlayer.getName(),
    });

    // let i;
    let existingPlayer;
    Object.keys(self.players).forEach((playerId) => {
      existingPlayer = self.players[playerId];
      it.emit(
        'new player',
        {
          id: existingPlayer.id,
          x: existingPlayer.getX(),
          y: existingPlayer.getY(),
          name: existingPlayer.getName(),
        }
      );
    });
    self.players[it.id] = newPlayer;
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 移动玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onMovePlayer(self, data) {
    const movePlayer = self.playerById(this.id);

    if (!movePlayer) {
      return;
    }

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setAngle(data.angle);
    movePlayer.setSpeed(data.speed);

    this.broadcast.emit('move player', {
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
  onShot(self, data) {
    const playerObj = self.playerById(this.id);
    this.broadcast.emit(
      'shot',
      {
        id: self.id,
        x: playerObj.getX(),
        y: playerObj.getY(),
      }
    );
  }

  /**
   * @summary 捕获 socket 事件
   * @param client: Socket 消息接收端
   */
  onSocketConnection(client) {
    const self = this;

    util.log(`New player has connected: ${client.id}`);

    client.on('disconnect', function () {
      self.onClientDisconnect.call(this, self);
    });

    client.on('new player', function (data) {
      self.onNewPlayer.call(this, self, data);
    });

    client.on('move player', function (data) {
      self.onMovePlayer.call(this, self, data);
    });

    client.on('shot', function (data) {
      self.onShot.call(this, self, data);
    });

    client.on('kill', function (data) {
      self.onKill.call(this, self, data);
    });
  }
}

module.exports = (server) => {
  new SocketHandler(server);
};
