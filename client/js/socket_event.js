
/**
 * @summary:
 *   socket事件类： 处理游戏事件
 * @description:
 *
 */

import RemotePlayer from './remote_player';


export default class SocketEvent {

  constructor(game, socket, player) {
    this.game = game;
    this.socket = socket;
    this.gamers = {};
    this.player = player;
    this.sPlayer = player.sPlayer;
  }

  init() {
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));
    this.socket.on('new player', this.onNewPlayer.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));
    this.socket.on('shot', this.onShot.bind(this));
    this.socket.on('kill', this.onKill.bind(this));
    return this;
  }

  // Socket connected
  onSocketConnected() {
    console.log('Connected to socket server');
    // Reset gamers on reconnect
    Object.keys(this.gamers).forEach((gamerId) => {
      const gamerObj = this.gamers[gamerId];
      gamerObj.player.kill();
    });
    this.gamers = {};

    // Send local player data to the game server
    this.socket.emit('new player', {
      x: this.sPlayer.x,
      y: this.sPlayer.y,
      angle: this.sPlayer.angle,
      name: this.sPlayer.name,
    });
  }

  // Socket disconnected
  onSocketDisconnect() {
    console.log('Disconnected from socket server');
  }

  // New player
  onNewPlayer(data) {
    console.log('New player connected:', data.id);

    // Avoid possible duplicate players
    const duplicate = this.gamerById(data.id, true);
    if (duplicate) {
      console.log('Duplicate player!');
      return;
    }
    // Add new player to the remote players array
    const gamer = new RemotePlayer(data.id, this.game, data.x, data.y, data.name, 'blue');
    this.gamers[data.id] = gamer;
    this.player.playerGroup.add(gamer.player);
  }

  // Move player
  onMovePlayer(data) {
    const PlayerObj = this.gamerById(data.id);
    // Player not found
    if (!PlayerObj) {
      return;
    }
    const movePlayer = PlayerObj.player;
    // Update player position
    this.game.physics.arcade.moveToXY(
      movePlayer,
      data.x,
      data.y,
      data.speed,
      166
    );
    // movePlayer.x = data.x;
    // movePlayer.y = data.y;
    movePlayer.angle = data.angle;
    // 移动
    movePlayer.animations.play('move');
  }

  // Shot
  onShot(data) {
    const gamerObj = this.gamerById(data.id);
    // Player not found
    if (!gamerObj) {
      return;
    }
    gamerObj.weapon.fire();
  }

  // Remove player
  onRemovePlayer(data) {
    const removePlayer = this.gamerById(data.id);
    // Player not found
    if (!removePlayer) {
      return;
    }
    removePlayer.player.kill();
    // Remove player from array
    delete this.gamers[data.id];
  }

  onKill(data) {
    const removePlayer = this.gamerById(data.id);
    // Player not found
    if (!removePlayer) {
      return;
    }

    removePlayer.player.kill();
    // Remove player from array
    delete this.gamers[data.id];
  }

  // Find player by ID
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
