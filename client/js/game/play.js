/*
 * 开始游戏
 */

import GameMap from '../role/map';
import Player from '../role/player';
import TouchControl from '../tool/touch_control';
import Attack from '../tool/attack';
import Explosion from '../tool/explosion';
import Boss from '../role/boss';
import Equipment from '../equipment/equipment';


export default class Play {
  constructor(game) {
    this.game = game;
    this.room = this.game.room;
    this.callback = this.game.callback;
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 600, 450);
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;
    self.game.time.desiredFps = 26;

    // 初始化触摸移动类
    self.touchControl = new TouchControl(this.game, this);
    // 初始化陆地
    self.game.add.tileSprite(0, 0, 2000, 2000, 'earth');
    // 初始化爆炸类
    self.explosion = new Explosion(self.game);
    // 存储所有子弹
    self.weaponsGroupList = [];
    // 初始化攻击类
    new Attack(self.game, self.room.socket);
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
      self.get_bornx(),
      isTopCamp ? 50 : self.game.world.height - 14,
      self.explosion,
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
      isTopCamp ? 15 : self.game.world.height - 15,
      self.explosion,
      self.room.socket
    );
    // 初始化敌人的 boss
    self.enemiesBoss = new Boss(
      self.game,
      isTopCamp ? 'bossBottom' : 'bossTop',
      isTopCamp ? '2' : '1',
      self.game.world.centerX,
      isTopCamp ? self.game.world.height - 15 : 15,
      self.explosion,
      self.room.socket
    );
    // 存储所有玩家组
    self.gamersGroup = self.game.add.group(self.game.world, 'gamers group');
    // 存储boss组
    self.bossGroupList = [self.boss.group, self.enemiesBoss.group];
    // 初始化地图类
    self.gameMap = new GameMap(self.game, self.explosion, self.room.socket);
    // 初始化装备类
    this.equipments = new Equipment(
      self.game,
      self.weaponsGroupList,
      self.room.socket
    );
    // 初始化爆炸组, 位于游戏最顶层
    self.explosion.setGroup('explosion group');

    self.game.camera.follow(self.sPlayer);
    self.room.player = self.player;
    self.callback(self);
  }

  update() {
    const self = this;
    self.gameMap.checkCollideOverlap(self.gamersGroup, self.weaponsGroupList);
    self.boss.checkCollideOverlap(self.sPlayer, self.bossGroupList, self.weaponsGroupList);
    self.player.checkCollideOverlap(self.gamersGroup, self.weaponsGroupList);
    self.player.move(self.touchControl);
    self.equipments.checkCollide(self.gamersGroup);
  }

  /*
  render() {
    const self = this;
    self.game.debug.text(`${self.game.time.fps}`, 2, 14, '#000');
    console.log(self.game.time.fps);
  }
  */

  get_bornx() {
    let bornx;
    if (Math.random() < 0.5) {
      bornx = Math.floor((Math.random() * 250) + 350);
    } else {
      bornx = Math.floor((Math.random() * 250) + 0);
    }
    return bornx;
  }
}
