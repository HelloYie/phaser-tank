'use strict';

const util = require('util');
const path = require('path');
const io = require('socket.io');
const Player = require('./player');
const port = process.env.PORT || 8080;

let socket;	// Socket controller
let players;	// object of connected players

module.exports = function init (server) {
  // Create an empty object to store players
  players = {};

  // Attach Socket.IO to server
  socket = io.listen(server);

  // Start listening for events
  setEventHandlers();
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */

const setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection);
}

// New socket connection
function onSocketConnection (client) {
  util.log('New player has connected: ' + client.id);

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect);

  // Listen for new player message
  client.on('new player', onNewPlayer);

  // Listen for move player message
  client.on('move player', onMovePlayer);

  // Listen for shot
  client.on('shot', onShot);
}

function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id);

  const removePlayer = playerById(this.id);

  if (!removePlayer) {
    return;
  }
  delete players[this.id];

  this.broadcast.emit('remove player', {id: this.id});
}

function onNewPlayer (data) {
  const newPlayer = new Player(data.x, data.y, data.angle, data.name);
  let self = this;
  newPlayer.id = this.id;

  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: newPlayer.getName()});

  let i, existingPlayer;
  Object.keys(players).forEach(function(playerId){
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

function onMovePlayer (data) {

  const movePlayer = playerById(this.id);

  if (!movePlayer) {
    return;
  }

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);
  movePlayer.setAngle(data.angle);

  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle()});
}

function onShot(data){
  let playerObj = playerById(this.id);
  let self = this;
  self.broadcast.emit(
    'shot',
    {
      id: self.id,
      x: playerObj.getX(),
      y: playerObj.getY(),
    }
  );
}

function playerById (id, silence) {
  let playerObj = players[id];
  if(playerObj){
    return playerObj;
  }
  else{
    if(!silence){
      util.log('Player not found: ', id);
    }
    return false;
  }
}
