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
import { define } from 'defines';
import {
  personDisplay,
  modeDisplay,
} from 'displays';

class Room {

  constructor() {
    const self = this;
    const query_args = queryString.parse(location.search);
    // hell房间方便开发时调试
    self.id = query_args.room_id || 'hell';
    self.name = query_args.name || utils.randomUserName();
    self.avatar = query_args.avatar || define.avatar;
    self.sex = query_args.sex || 0;
    self.persons = query_args.persons || 'hell';
    self.mode = query_args.mode || 'hell';
    $('.persons').text(personDisplay[self.persons]);
    $('.mode').text(modeDisplay[self.mode]);
    self.socket = IO.connect();
    self.sEvent = new SocketEvent(self, self.socket);
    self.compileTpls();
    self.init();
  }

  init() {
    const self = this;
    $('.user_container').append(
      self.user_tpl({
        plainId: 'self',
        name: self.name,
        avatar: self.avatar,
      })
    );
    wx.config({
      debug: false,
      appId: 'wx3ddbcc094e20fe19',
      timestame: new Date().getTime(),
      nonceStr: '',
      signature: '',
      jsApiList: [],

    });
    wx.onMenuShareTimeline({
      title: '坦克大战${self.persons}${self.mode}', // 分享标题
      link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3ddbcc094e20fe19&redirect_uri=http://wx.burnish.cn/ui/tank.html?room_id=${self.id}&response_type=code&scope=snsapi_userinfo#wechat_redirect', // 分享链接
      imgUrl: 'http://obdp0ndxs.bkt.clouddn.com/kzgame.png', // 分享图标
      success() {
          // 用户确认分享后执行的回调函数
      },
      cancel() {
          // 用户取消分享后执行的回调函数
      },
    });
  }

  compileTpls() {
    const self = this;
    self.user_tpl = _.template($('#user_tpl').html());
  }

  otherJoined(data) {
    // 其他玩家加入房间
    const self = this;
    data.plainId = utils.plainId(data.id);
    console.log(data);
    $('.user_container').append(
      self.user_tpl(data)
    );
  }

}
export default Room;
