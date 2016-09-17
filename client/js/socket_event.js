
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 *
 */
import RemotePlayer from './remote_player';


export default class SocketEvent {
  constructor(game, player, socket) {
    const self = this;
    self.game = game;
    self.socket = socket;
    self.gamers = {};
    self.player = player;
    self.sPlayer = player.sPlayer;
    return self.init();
  }

  init() {
    const self = this;
    const events = {
      connect: self.onSocketConnected,
      'join room': self.onJoinRoom,
      'game start': self.onGameStart,
      disconnect: self.onSocketDisconnect,
      'new player': self.onNewPlayer,
      'move player': self.onMovePlayer,
      'remove player': self.onRemovePlayer,
      shot: self.onShot,
    };

    Object.keys(events).forEach((event) => {
      self.socket.on(event, events[event].bind(self));
    });
    return self;
  }

  onSocketConnected() {
    console.log('Connected to socket server');
  }

  onGameStart() {
    Object.keys(this.gamers).forEach((gamerId) => {
      const gamerObj = this.gamers[gamerId];
      gamerObj.player.kill();
    });
    this.gamers = {};
    this.socket.emit('new player', {
      x: this.sPlayer.x,
      y: this.sPlayer.y,
      angle: this.sPlayer.angle,
      id: this.sPlayer.id,
    });
    this.player.id = this.socket.id;
  }

  onSocketDisconnect() {
    console.log('Disconnected from socket server');
  }

  // 自己和别人加入游戏
  onNewPlayer(data) {
    console.log('New player connected:', data.id);

    const duplicate = this.gamerById(data.id, true);
    if (duplicate) {
      console.log('Duplicate player!');
      return;
    }
    const gamer = new RemotePlayer(data.id, this.game, data.x, data.y, data.name, 'blue');
    this.gamers[data.id] = gamer;
    this.player.playerGroup.add(gamer.player);
  }

  onMovePlayer(data) {
    const playerObj = this.gamerById(data.id);
    if (!playerObj) {
      return;
    }
    const movePlayer = playerObj.player;
    movePlayer.x = data.x;
    movePlayer.y = data.y;
    movePlayer.angle = data.angle;
    movePlayer.animations.play('move');
  }

  onShot(data) {
    const gamerObj = this.gamerById(data.id);
    if (!gamerObj) {
      return;
    }
    gamerObj.weapon.fire();
  }

  onJoinRoom(data) {
    console.log('join');
    console.log(data);
  }

  onRemovePlayer(data) {
    const removePlayer = this.gamerById(data.id);
    if (!removePlayer) {
      return;
    }
    removePlayer.player.kill();
    delete this.gamers[data.id];
  }

  gamerById(id, silence = false) {
    const gamerObj = this.gamers[id];
    if (gamerObj) {
      return gamerObj;
    }
    if (!silence) {
      console.log('Player not found: ', id);
    }
    return false;
  }
}
