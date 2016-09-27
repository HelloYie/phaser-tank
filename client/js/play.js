/*
 * 开始游戏
 */

import GameMap from './map';
import Player from './player';
import TouchControl from './touch_control';
import Attack from './attack';
import Explosion from './explosion';
import Boss from './boss';

export default class Play {
  constructor(game) {
    this.game = game;
    this.room = this.game.room;
    this.callback = this.game.callback;
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 600, 600);
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;

    // 初始化触摸移动类
    self.touchControl = new TouchControl(this.game, this);
    // 初始化陆地
    self.land = self.game.add.tileSprite(0, 0, 2000, 2000, 'earth');
    // 初始化爆炸类
    self.explosion = new Explosion(self.game);
    // 初始化攻击类
    new Attack(self.game, self.room.socket);
    // 初始化地图类
    self.gameMap = new GameMap(self.game, self.explosion, self.room.socket);
    // 初始化玩家, 哪个队先进来，那个队就在下面.
    const isTopCamp = self.room.camp === '1';
    self.player = new Player(
      self.room.socket.id,
      self.game,
      'tank',
      self.room.name,
      self.room.sex,
      self.room.camp,
      self.room.avatar,
      self.game.world.centerX + 100,
      isTopCamp ? 50 : self.game.world.height - 14,
      'bullet',
      self.room.socket
    );
    self.room.socket.emit(
      'new player',
      {
        x: self.player.startX,
        y: self.player.startY,
        name: self.player.name,
        avatar: self.player.avatar,
        camp: self.player.camp,
        sex: self.player.sex,
      }
    );
    self.sPlayer = self.player.sPlayer;
    // 初始化自己的 boss
    self.boss = new Boss(
      self.game,
      isTopCamp ? 'bossTop' : 'bossBottom',
      self.room.camp,
      self.game.world.centerX,
      isTopCamp ? 20 : self.game.world.height - 20,
      self.explosion,
      self.room.socket
    );
    // 初始化敌人的 boss
    self.enemiesBoss = new Boss(
      self.game,
      isTopCamp ? 'bossBottom' : 'bossTop',
      isTopCamp ? '2' : '1',
      self.game.world.centerX,
      isTopCamp ? self.game.world.height - 20 : 20,
      self.explosion,
      self.room.socket
    );
    self.game.camera.follow(self.sPlayer);
    self.room.player = self.player;
    self.game.world.bringToTop(self.gameMap.crossGroup);
    self.callback(self);
  }

  update() {
    const self = this;
    const enemiesGroup = self.room.sEvent.enemiesGroup;
    self.gameMap.checkCollideOverlap(self.sPlayer);
    self.enemiesBoss.checkCollideOverlap(self.sPlayer);
    self.player.checkCollideOverlap(enemiesGroup);
    self.player.move(self.touchControl);
  }
}
