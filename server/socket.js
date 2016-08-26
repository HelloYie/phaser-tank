'use strict';

const util = require('util');
const io = require('socket.io');
const Player = require('./player');

let socket;	// Socket controller
let players;	// object of connected players

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */

function playerById(id, silence) {
  const playerObj = players[id];
  if (playerObj) {
    return playerObj;
  }
  if (!silence) {
    util.log('Player not found: ', id);
  }
  return false;
}

function onKill(data) {
  console.log(data);
  const removePlayer = playerById(data.id);
  // Player not found
  if (!removePlayer) {
    return;
  }

  // removePlayer.player.kill();
  console.log(removePlayer);
  // Remove player from array
  delete players[data.id];
  this.broadcast.emit('kill', { id: data.id });
}

function onClientDisconnect() {
  util.log(`Player has disconnected: ${this.id}`);

  const removePlayer = playerById(this.id);

  if (!removePlayer) {
    return;
  }
  delete players[this.id];

  this.broadcast.emit('remove player', { id: this.id });
}

function onNewPlayer(data) {
  const newPlayer = new Player(data.x, data.y, data.angle, data.name);
  const self = this;
  newPlayer.id = this.id;

  this.broadcast.emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: newPlayer.getName() });

  // let i;
  let existingPlayer;
  Object.keys(players).forEach((playerId) => {
    existingPlayer = players[playerId];
    self.emit(
      'new player',
      {
        id: existingPlayer.id,
        x: existingPlayer.getX(),
        y: existingPlayer.getY(),
        name: existingPlayer.getName(),
      }
    );
  });

  players[this.id] = newPlayer;
}

function onMovePlayer(data) {
  const movePlayer = playerById(this.id);

  if (!movePlayer) {
    return;
  }

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);
  movePlayer.setAngle(data.angle);

  this.broadcast.emit('move player', { id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle() });
}

function onShot(data) {
  const playerObj = playerById(this.id);
  const self = this;
  self.broadcast.emit(
    'shot',
    {
      id: self.id,
      x: playerObj.getX(),
      y: playerObj.getY(),
    }
  );
}

// New socket connection
function onSocketConnection(client) {
  util.log(`New player has connected: ${client.id}`);

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect);

  // Listen for new player message
  client.on('new player', onNewPlayer);

  // Listen for move player message
  client.on('move player', onMovePlayer);

  // Listen for shot
  client.on('shot', onShot);

  client.on('kill', onKill);
}

const setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection);
};

module.exports = function init(server) {
  // Create an empty object to store players
  players = {};
  // Attach Socket.IO to server
  socket = io.listen(server);
  // Start listening for events
  setEventHandlers();
};
