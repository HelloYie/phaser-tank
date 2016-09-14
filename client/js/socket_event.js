
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 *
 */
import RemotePlayer from './remote_player';


export default class SocketEvent {
  constructor(game, player, socket) {
    this.game = game;
    this.socket = socket;
    this.gamers = {};
    this.player = player;
    this.sPlayer = player.sPlayer;
    return this.init();
  }

  init() {
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));
    this.socket.on('new player', this.onNewPlayer.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));
    this.socket.on('shot', this.onShot.bind(this));
    return this;
  }

  onSocketConnected() {
    console.log('Connected to socket server');
    Object.keys(this.gamers).forEach((gamerId) => {
      const gamerObj = this.gamers[gamerId];
      gamerObj.player.kill();
    });
    this.gamers = {};
    this.socket.emit('new player', {
      x: this.sPlayer.x,
      y: this.sPlayer.y,
      angle: this.sPlayer.angle,
      name: this.sPlayer.name,
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
