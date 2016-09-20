/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/room.css';

import $ from 'jquery';
import wx from 'weixin-js-sdk';
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
    const queryArgs = queryString.parse(location.hash);
    // hell房间方便开发时调试
    self.id = queryArgs.roomId || 'hell';
    self.name = queryArgs.name || utils.randomUserName();
    self.avatar = queryArgs.avatar || define.avatar;
    self.sex = queryArgs.sex || 0;
    self.persons = queryArgs.persons || 'hell';
    self.mode = queryArgs.mode || 'hell';
    // TODO: 创建者将mode与persons同步到node服务器， 加入者无法修改
    if (self.mode === 'hell') {
      // hell 房间只有一个
      self.id = 'hell';
    }
    self.signTimeStamp = queryArgs.signTimeStamp;
    self.signNonceStr = queryArgs.signNonceStr;
    self.signature = queryArgs.signature;
    self.appId = queryArgs.appId;
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
      appId: self.appId,
      timestamp: self.signTimeStamp,
      nonceStr: self.signNonceStr,
      signature: self.signature,
      jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],

    });
    wx.onMenuShareTimeline({
      title: '坦克大战${self.persons}${self.mode}', // 分享标题
      link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=${self.appId}&redirect_uri=http://wx.burnish.cn/ui/tank.html?room_id=${self.id}&response_type=code&scope=snsapi_userinfo#wechat_redirect', // 分享链接
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
