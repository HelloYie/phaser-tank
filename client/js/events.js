/*
 * jquery事件绑定类
 */

import $ from 'jquery';


class RoomEvents {
  constructor(room) {
    const self = this;
    self.room = room;
    $(() => {
    }).on('click', '.start_game', () => {
      self.startGame();
    });
  }

  startGame() {
    self.room.socket.emit(
      'start game',
      {
        mode: self.room.mode,
        persons: self.room.persons,
      }
    );
  }
}

export {
  RoomEvents,
};
