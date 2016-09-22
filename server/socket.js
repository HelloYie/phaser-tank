'use strict';

/**
 * 处理 socket 事件
 */


const util = require('util');
const io = require('socket.io');
const Player = require('./player');
const uuid = require('uuid');
const utils = require('./utils');
const TeamFeightPool = require('./team_feight_pool')
const Rooms = require('./rooms')


class SocketHandler {
  constructor(server) {
    const self = this;
    self.players = new Map();
    self.rooms = new Rooms(self);
    self.socket = io.listen(server);
    self.socket.sockets.on('connection', (client) => {
      self.onSocketConnection.call(self, client);
    });
    self.teamFeightPool = new TeamFeightPool(self);
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
      'kill player': self.onKill,
      'join room': self.onJoinRoom,
      'loading progress': self.onLoadingProgress,
      'start game': self.onStartGame,
    };

    util.log(`New player has connected: ${client.id}`);
    client.handler = self;

    // bild event with client
    Object.keys(events).forEach((event) => {
      client.on(event, function(data){
        events[event](client, data);
      });
    });
  }

  /**
   * @param id [String] 玩家id
   * @param silence [Boolean] 是否是静默的玩家
   * @return playerObj or false
   */
  playerById(id, silence) {
    const self = this;
    const playerObj = self.players.get(utils.serverId(id));
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
  onClientDisconnect(client, data) {
    const self = client.handler;
    util.log(`Player has disconnected: ${client.id}`);
    const removePlayer = self.playerById(client.id);

    if (!removePlayer) {
      return;
    }

    self.rooms.removePlayer(client.roomId, client.id);
    self.players.delete(client.id);
    client.to(client.roomId).emit('remove player', { id: client.id });
    client.leave(client.roomId);
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 创建玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onNewPlayer(client, data) {
    const self = client.handler;
    const newPlayer = self.playerById(client.id);
    newPlayer.setAttrs(data);
    client.to(client.roomId).emit('new player', {
      id: newPlayer.id,
      x: newPlayer.x,
      y: newPlayer.y,
      sex: newPlayer.sex,
      name: newPlayer.name,
      camp: newPlayer.camp,
      avatar: newPlayer.avatar,
    });

    const roomPlayers = self.rooms.roomPlayers(client.roomId);
    for(let player of roomPlayers) {
      client.emit(
        'new player',
        {
          id: player.id,
          x: player.x,
          y: player.y,
          name: player.name,
          camp: player.camp,
          avatar: player.avatar,
        }
      );
    }
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @param data: [Object] 移动玩家后返回的数据
   * @this [Object] Socket 实例
   */
  onMovePlayer(client, data) {
    const self = client.handler;
    const movePlayer = self.playerById(client.id);

    if (!movePlayer) {
      return;
    }

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setAngle(data.angle);
    movePlayer.setSpeed(data.speed);

    const moveInfo = {
      id: movePlayer.id,
      angle: movePlayer.getAngle(),
      speed: movePlayer.getSpeed(),
      x: movePlayer.getX(),
      y: movePlayer.getY(),
    };
    client.to(client.roomId).emit('move player', moveInfo);
    client.emit('move player', moveInfo);
  }

  /**
   * @param self: [Object] SocketHandler 实例
   * @this [Object] Socket 实例
   */
  onShot(client) {
    client.to(client.roomId).emit('shot',
      {
        id: client.id,
      }
    );
    client.emit('shot', {
      id: client.id,
    });
  }

  onKill(client, data) {
    client.to(client.roomId).emit('kill player', {
      id: data.id,
    });
    client.emit('kill player', {
      id: data.id,
    });
  }

  onJoinRoom(client, data) {
    const self = client.handler;
    if(self.playerById(client.id)){
      return;
    }
    const newPlayer = new Player({
      avatar: data.avatar,
      name: data.name,
      id: client.id,
      roomId: data.id,
      sex: data.sex,
    });
    client.roomId = data.id;
    // 加入socket 房间
    client.join(client.roomId);

    const room = self.rooms.getRoom(client.roomId);
    if(room) {
      for(let player of room.values()) {
        client.emit(
          'join room',
          {
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            sex: player.sex,
            loadingProgress: player.loadingProgress,
          }
        );
      }
    } else {
      self.rooms.addRoom(client.roomId);
    }

    client.to(client.roomId).emit(
      'join room',
      {
        id: newPlayer.id,
        avatar: newPlayer.avatar,
        name: newPlayer.name,
        sex: newPlayer.sex,
        loadingProgress: newPlayer.loadingProgress,
      }
    );

    self.players.set(client.id, newPlayer);
    self.rooms.addPlayer(client.roomId, newPlayer);
  }

  onLoadingProgress(client, data) {
    const self = client.handler;
    const player = self.playerById(data.id);
    player.loadingProgress = data.progress;
    client.to(client.roomId).emit(
      'loading progress',
      {
        id: data.id,
        progress: data.progress,
      }
    );
  }

  onStartGame(client, data) {
    const self = client.handler;
    if (data.mode === 'hell'){
      // 地狱乱斗
      self.startHell(client);
    } else if (data.mode === 'team_feight' ){
      // 组队对战
      self.startTeamFeight(client, data.persons);
    }
  }

  startHell(client) {

    client.to(client.roomId).emit(
      'start game',
      {
        camp: uuid.v4(),
      }
    );
    client.emit(
      'start game',
      {
        camp: uuid.v4(),
      }
    );
  }

  startTeamFeight(client, persons) {
    // TODO 匹配池中查询， 没有对手就丢进匹配池等待
    const self = this;
    self.teamFeightPool.match(client.roomId, persons);
  }
}

module.exports = (server) => {
  new SocketHandler(server);
};
