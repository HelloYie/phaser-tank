'use strict';

const util = require('util');
const path = require('path');
const io = require('socket.io');
const Player = require('./Player');
const port = process.env.PORT || 8080;

let socket;	// Socket controller
let players;	// Array of connected players

module.exports = function init (server) {
  // Create an empty array to store players
  players = [];

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
}

function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id);

  const removePlayer = playerById(this.id);

  if (!removePlayer) {
    util.log('Player not found: ' + this.id);
    return;
  }

  players.splice(players.indexOf(removePlayer), 1);

  this.broadcast.emit('remove player', {id: this.id});
}

function onNewPlayer (data) {
  const newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;

  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

  let i, existingPlayer;
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  }

  players.push(newPlayer);
}

function onMovePlayer (data) {
  
  const movePlayer = playerById(this.id);

  if (!movePlayer) {
    util.log('Player not found: ' + this.id);
    return;
  }

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);
  
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
}

function playerById (id) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i];
    }
  }
  return false;
}
