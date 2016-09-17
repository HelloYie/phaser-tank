/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/room.css';

import $ from 'jquery';
import _ from 'underscore';
import queryString from 'query-string';

import utils from 'base_utils';
import SocketEvent from './socket_event';

class Room {

  constructor() {
    const self = this;
    // hell房间方便开发时调试
    self.id = queryString.parse(location.search).roomId || 'hell';
    self.socket = IO.connect();
    self.sEvent = new SocketEvent(self, self.socket);
    self.compileTpls();
    self.init();
    self.bind_events();
  }

  init() {
    const self = this;
    $('.user_container').append(
      self.user_tpl({
        plainId: 'self',
        name: '本尊',
        avatar: 'http://obdp0ndxs.bkt.clouddn.com/admin_charts.png',
      })
    );
  }

  compileTpls() {
    const self = this;
    self.user_tpl = _.template($('#user_tpl').html());
  }

  otherJoined(data) {
    // 其他玩家加入房间
    const self = this;
    data.plainId = utils.plainId(data.id);
    $('.user_container').append(
      self.user_tpl(data)
    );
  }

  bind_events() {

  }

}
export default Room;
