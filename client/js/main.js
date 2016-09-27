/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/bootstrap.css';
import 'css/base.css';
import 'css/reset.css';
import 'css/game.css';

import Room from './room';
import { RoomEvents } from './events';
import { ImagePreLoader } from './images';


// 主入口调用
require.ensure([], () => {
  // 初始化房间
  window.IO = require('./lib/socket.io-client')(
    '/',
    {
      forceNew: false,
      'force new connect': false,
      multiplex: true,  // 上面都是为了不开新链接
      reconnectionAttempts: 1,  // 尝试重连1次(开启固定ID后尝试4次)
      reconnectionDelay: 1000,  // 延时1s重连
      reconnectionDelayMax: 2000, // 最多延时2s
      timeout: 1000,
    }
  );
  window.$ = window.jQuery = require('jquery');
  window._ = require('underscore');
  require('./lib/bootstrap');

  const room = new Room();

  new RoomEvents(room);
  _.delay(() => room.progressGo('self', 20), 1000);

  require.ensure([], () => {
    // 游戏资源加载
    window.PIXI = require('./lib/pixi.min');

    _.delay(() => room.progressGo('self', 50), 1000);

    require.ensure([], () => {
      window.Phaser = require('./lib/phaser-arcade-physics.min');

      require('./lib/phaser-touch-control');

      new ImagePreLoader(() => {
        _.delay(() => room.progressGo('self', 100), 1000);
      });
    });
  });
});
