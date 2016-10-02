/*
 * 游戏主入口
 */
import preload from './preload';
import play from './play';


export default class TankGame {
  constructor(room, callback) {
    const self = this;
    $('.room_container').remove();
    const gameRatio = window.innerWidth / window.innerHeight;
    self.game = new Phaser.Game(
      640 * gameRatio,
      640,
      Phaser.CANVAS,
      ''
    );
    self.game.room = room;
    self.game.callback = callback || function () { };
    self.game.state.add('preload', preload);
    self.game.state.add('play', play);
    self.game.state.start('preload');
    self.game.angle = 90;
  }
}
