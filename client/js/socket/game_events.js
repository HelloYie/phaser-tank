/**
 * 处理游戏事件
 */

import TankGame from '../game/game';


export default {
  onSocketConnected: function x() {
    const self = this;
    console.log('Connected to socket server');
    // 加入房间
    self.socket.emit('join room', {
      id: self.room.id,  // room id
      name: self.room.name,
      avatar: self.room.avatar,
      sex: self.room.sex,
    });
  },

  onSocketDisconnect: function x() {
    const self = this;
    console.log('Disconnected from socket server');
    self.room.disconnect();
  },

  onJoinRoom: function x(data) {
    const self = this;
    self.room.otherJoined(data);
  },

  onStartGame: function x(data) {
    const self = this;
    self.room.id = data.roomId;
    self.room.camp = data.camp;
    new TankGame(self.room, (o) => {
      self.game = o.game;
      self.player = o.player;
      self.explosion = o.explosion;
      self.gameMap = o.gameMap;
      self.boss = o.boss;
      self.enemiesBoss = o.enemiesBoss;
      self.gamersGroup = o.gamersGroup;
      self.equipments = o.equipments;
      self.otherWeaponsGroupList = o.otherWeaponsGroupList;
      self.sprialWeaponsGroupList = o.sprialWeaponsGroupList;
      self.gamers[self.player.id] = self.player;
      self.gamersGroup.add(self.player.sPlayer);

      const weaponKey = self.player.weapon.group.getFirstExists(false).key;
      if (weaponKey === 'bulletSprial') {
        self.sprialWeaponsGroupList.push(self.player.weapon.group);
      } else {
        self.otherWeaponsGroupList.push(self.player.weapon.group);
      }

      // 解绑之前的所有事件
      Object.keys(self.roomEvents).forEach((event) => {
        self.socket.removeAllListeners(event);
      });

      Object.keys(self.gameEvents).forEach((event) => {
        self.socket.on(event, self.gameEvents[event].bind(self));
      });
    });
  },

  onLeaveRoom: function x(data) {
    $(`.room_user#${data.id}`).remove();
  },

  onLoadingProgress: function x(data) {
    const self = this;
    self.room.progressGo(data.id, data.progress);
  },

  onMatching: function x() {
    const self = this;
    self.room.matching();
  },
};
