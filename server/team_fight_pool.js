/**
 *  团队赛匹配池
 */

'use strict';


const uuid = require('uuid');


class TeamFightPool {

  constructor(socketHandler) {
    const self = this;
    self.socketHandler = socketHandler;
    self.rooms = socketHandler.rooms;
    self.person1 = [];
    self.person3 = [];
    self.person5 = [];
    self.person10 = [];
  }

  match(roomId, persons) {
    const self = this;
    const pool = self[`person${persons}`];
    const room = self.rooms.getRoom(roomId);
    if (!room) {
      // 房间已解散，取消匹配
      return false;
    }
    let oppoRoomId;
    let oppoRoom;
    while (pool.length) {
      // 取一个还存在的room
      oppoRoomId = pool.shift();
      if (oppoRoomId === roomId){
        // 自己，不开始
        continue;
      }

      oppoRoom = self.rooms.getRoom(oppoRoomId);
      if (oppoRoom) {
        // 找到合适的房间， 开始
        break;
      }

      // 房间已解散，继续匹配下一个

    }
    if (oppoRoom) {
      // 有对手， 开始游戏
      self.startFight([roomId, oppoRoomId]);
    }
    else {
      // 无对手， 丢进匹配池
      pool.push(roomId);
      return false;
    }
  }

  startFight(roomIds) {
    // 生成战斗房间
    const self = this;
    const fightRoomId = uuid.v4();
    const fightRoom = self.rooms.addRoom(fightRoomId);
    for (let roomId of roomIds) {
      for (let player of self.rooms.roomPlayers(roomId)) {
        self.rooms.addPlayer(fightRoomId, player);
        player.client.roomId = fightRoomId;
      }
    }

    let room;
    let start_data;
    for (let roomId of roomIds) {
      // 开始战斗
      room = self.rooms.getRoom(roomId);
      start_data = {
        camp: String(roomIds.indexOf(roomId) + 1),
        roomId: fightRoomId,
      };
      self.socketHandler.socket.sockets.to(roomId).emit(
        'start game',
        start_data
      );

      // 移除组队房间
      self.rooms.deleteRoom(roomId);
    }

  }

}

module.exports = TeamFightPool;
