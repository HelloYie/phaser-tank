/**
 * 房间管理器
 */

'use strict';


class Rooms {

  constructor(socketHandler) {
    const self = this;
    self.socketHandler = socketHandler;
    self.rooms = new Map();
  }

  addPlayer(roomId, player) {
    const self = this;
    let room = self.getRoom(roomId);
    if (!room){
      room = self.addRoom(roomId);
    }
    room.set(player.id, player);
    return room;
  }

  removePlayer(roomId, clientId) {
    const self = this;
    const room = self.getRoom(roomId);
    if (!room){
      return false;
    }
    room.delete(clientId);
    if (room.size === 0) {
      self.removeRoom(roomId);
    }
    return true;
  }

  getRoom(roomId) {
    const self = this;
    return self.rooms.get(roomId);
  }

  removeRoom(roomId) {
    const self = this;
    self.rooms.delete(roomId);
  }

  addRoom(roomId) {
    const self = this;
    self.rooms.set(roomId, new Map());
    return self.getRoom(roomId);
  }

  roomPlayers(roomId) {
    const self = this;
    const room = self.getRoom(roomId);
    if (!room) {
      return [];
    }
    return room.values();
  }
}

module.exports = Rooms;
