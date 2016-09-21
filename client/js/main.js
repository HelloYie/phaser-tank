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


// 主入口调用
require.ensure([], () => {
  // 初始化房间


  window.IO = require('./lib/socket.io-client');
  window.$ = window.jQuery = require('jquery');
  require('./lib/bootstrap');

  window.room = new Room();

  new RoomEvents(window.room);

  require.ensure([], () => {
    // 游戏资源加载
    window.PIXI = require('./lib/pixi.min');

    window.p2 = require('./lib/p2.min');

    require.ensure([], () => {
      window.Phaser = require('./lib/phaser-split.min');

      require('./lib/phaser-touch-control');
    });
  });
});
