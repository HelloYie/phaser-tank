/**
 *  团队赛匹配池
 */

'use strict';


class TeamFeightPool {

  constructor(socketHandler){
    const self = this;
    self.socketHandler = socketHandler;
    self.person3 = [];
    self.person5 = [];
    self.person10 = [];
  }

  match(roomId, persons){
    const self = this;
    const pool = self[`person${persons}`];
    let oppoRoomId;
    let oppoRoom;
    while (pool.length) {
      oppoRoomId = pool.shift();
    }
  }

}

module.exports = TeamFeightPool;
