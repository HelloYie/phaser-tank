/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/bootstrap.css';
import 'css/room.css';
import $ from 'jquery';
import _ from 'underscore';
import queryString from 'query-string';

class Room {

  constructor() {
    // hell房间方便开发时调试
    this.id = queryString.parse(location.search).roomId || 'hell';
    this.compileTpls();
    this.joinRoom();
  }

  compileTpls() {
    this.user_tpl = _.template($('#user_tpl').html());
  }

  joinRoom() {
    // 加入房间
    this.socket = IO.connect();
    this.socket.emit('join room', {
      id: this.id,  // room id
      name: '周大汪',
      avatar: 'http://obdp0ndxs.bkt.clouddn.com/admin_charts.png',
    });
  }

  syncRoom() {
    // 同步房间信息
  }

}
export default Room;
