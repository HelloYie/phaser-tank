/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/room.css';

import wx from 'weixin-js-sdk';
import _ from 'underscore';
import queryString from 'query-string';

import utils from 'base_utils';
import SocketEvent from './socket_event';
import {
  define,
  tips,
} from 'defines';
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
    self.sex = Number(queryArgs.sex || 0);
    if (self.sex === 1) {
      self.sex_display = '♂';
    } else if (self.sex === 2) {
      self.sex_display = '♀';
    } else {
      self.sex_display = '⚥';
    }
    self.persons = queryArgs.persons || 'hell';
    self.mode = queryArgs.mode || 'hell';
    if (self.mode === 'hell') {
      // hell 房间只有一个
      self.id = 'hell';
    }
    self.signTimeStamp = queryArgs.signTimeStamp;
    self.signNonceStr = queryArgs.signNonceStr;
    self.signature = queryArgs.signature;
    self.appId = queryArgs.appId;
    self.personsDisplay = personDisplay[self.persons];
    self.modeDisplay = modeDisplay[self.mode];
    $('.persons').text(self.personsDisplay);
    $('.mode').text(self.modeDisplay);
    self.socket = IO.connect();
    self.sEvent = new SocketEvent(self, self.socket);
    self.compileTpls();
    self.init();
    self.tips();
    if (self.mode === 'hell') {
      // 地狱模式1分钟之后可以忽略等待直接开始
      self.waitTimeout = setTimeout(
        self.allReady,
        60 * 1000
      );
    }
  }

  init() {
    const self = this;
    $('.user_container').append(
      self.user_tpl({
        clientId: 'self',
        name: self.name,
        avatar: self.avatar,
        sex: self.sex,
        loadingProgress: 0,
      })
    );
    wx.config({
      debug: false,
      appId: self.appId,
      timestamp: self.signTimeStamp,
      nonceStr: self.signNonceStr,
      signature: self.signature,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'hideAllNonBaseMenuItem',
        'showMenuItems',
      ],
    });
    wx.ready(() => {
      self.defineShare();
    });
  }

  tips() {
    let index = 1;
    $('.tip').text(tips[0]);
    const tipInterval = setInterval(
      () => {
        $('.tip').text(tips[index]);
        index += 1;
        if (index > tips.length) {
          clearInterval(tipInterval);
        }
      },
      5000
    );
  }

  defineShare() {
    const self = this;
    const title = `坦克大战${self.personsDisplay}${self.modeDisplay}`;
    const link = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${self.appId}&redirect_uri=http://wx.burnish.cn/ui/tank.html?roomId=${self.id}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
    const imgUrl = 'http://obdp0ndxs.bkt.clouddn.com/kzgame.png';
    const desc = '快召游戏其乐无穷来啦';
    // 隐藏其他功能
    wx.hideAllNonBaseMenuItem();
    wx.showMenuItems({
      menuList: [
        'menuItem:share:appMessage',
        'menuItem:share:timeline',
      ],
    });
    wx.onMenuShareTimeline({
      title, // 分享标题
      link, // 分享链接
      imgUrl, // 分享图标
      success() {
          // 用户确认分享后执行的回调函数
      },
      cancel() {
          // 用户取消分享后执行的回调函数
      },
    });

    wx.onMenuShareAppMessage({
      title, // 分享标题
      desc, // 分享描述
      link, // 分享链接
      imgUrl, // 分享图标
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
    self.disconnect_tpl = _.template($('#disconnect_tpl').html());
    self.lg_modal = $('#lg_modal');
  }

  otherJoined(data) {
    // 其他玩家加入房间
    const self = this;
    data.clientId = utils.clientId(data.id);
    $('.user_container').append(
      self.user_tpl(data)
    );
    if (data.loadingProgress === 0) {
      // 可能是异常链接, 进度条不会涨, 10s后无响应则移除之
      const $user_container = $(`.user_container #${data.clientId}`);
      setTimeout(
        () => {
          if (parseInt($user_container.find('.progress-bar').css('width'), 10) === 0) {
            $user_container.remove();
          }
        },
        1000 * 10
      );
    }
  }

  readyCheck() {
    const self = this;
    if ($('.progress:visible').length) {
      return false;
    }
    if (self.persons === 'hell') {
      self.allReady();
      return true;
    } else if ($('.room_user').length >= Number(self.persons)) {
      self.allReady();
      return true;
    }
    return false;
  }

  allReady() {
    $('.wait_game').hide();
    $('.start_game').removeClass('hide');
  }

  progressGo(userId, progress) {
    const self = this;
    if (userId === 'self') {
      // 同步进度给其他玩家
      const socketId = self.socket.id;
      if (socketId) {
        self.socket.emit(
          'loading progress',
          {
            id: self.socket.id,
            progress,
          }
        );
      }
    }

    const $progressBar = $(`#${userId} .progress-bar`);
    $progressBar.css('width', `${progress}%`);
    $progressBar.data('progress', progress);
    if (progress === 100) {
      setInterval(() => {
        $progressBar.closest('.progress').hide();
        self.readyCheck();
      }, 1000);
    } else {
      // 进度条假蠕动
      let index = 0;
      const selfKillInterval = setInterval(
        () => {
          const realProgress = $progressBar.data('progress');
          let displayProgress = parseInt($progressBar.css('width'), 10);
          if (index > 100) {
            console.log(userId, realProgress, displayProgress);
          }
          index += 1;
          if (realProgress < displayProgress && realProgress + 29 < displayProgress) {
            displayProgress += 1;
            $progressBar.css('width', `${displayProgress}%`);
          } else {
            clearInterval(selfKillInterval);
          }
        },
        500
      );
    }
  }

  matching() {
    $('.start_game').text('匹配中，请耐心等待...').prop('disabled', true);
  }

  disconnect() {
    const self = this;
    self.lg_modal.find('.modal-content').html(self.disconnect_tpl());
    self.lg_modal.modal({
      backdrop: 'static',
      keyboard: false,
    });
  }

}
export default Room;
