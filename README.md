# 微信版坦克大战
===


## 游戏背景

为了跟微信好友一起玩坦克大战游戏。

## 游戏功能简介

* 游戏运行在微信公众号的网页上，给群里的好友发送一个邀请链接后即可加入房间对战。
* 邀请微信好友进入房间，进行多人的竞技。
* 游戏设置有坦克 + 砖头 + 石头 + 草丛 + 道具。
* 进入游戏后，玩家可以移动，并向其他玩家发射子弹。
* 玩家有一定的生命值，能打开砖头，能穿越草丛。
* 地图上随机产生道具，玩家获得后会有增益效果。
* 当生命值为0时游戏失败，直至最后一个为胜利者。


## 快速开始

* `npm install`
* `npm start`
* 访问 http://localhost:3000

## 游戏架构

**前端**

* [phaser](https://github.com/photonstorm/phaser)负责前端游戏引擎和前端逻辑。
* [socket.io-client](https://github.com/socketio/socket.io)负责玩家的即时通信。

**后端**

* [express](https://github.com/expressjs/express), 作为游戏后端，负责处理多玩家的通信，以及处理后端逻辑和公共资源的读写。
* [socket.io](https://github.com/socketio/socket.io)负责玩家的即时通信。
