/*
 * jquery事件绑定类
 */


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
    const self = this;
    self.room.matching();
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
