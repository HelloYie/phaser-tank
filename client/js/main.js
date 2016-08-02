/**
 * @summ 游戏主入口
 * @desc  负责绘制整个游戏, 并监听socket
 */

import 'pixi.js';
import 'p2';
import 'phaser';
import 'socket.io-client';
import './RemotePlayer';
import lightSandPng from  'assets/light_sand.png';
import dudePng from  'assets/dude.png';

import 'css/reset.css';
import 'css/game.css';

const game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload () {
  game.load.image('earth', lightSandPng);
  game.load.spritesheet('dude', dudePng, 64, 64);
  game.load.spritesheet('enemy', dudePng, 64, 64);
}

let socket; // Socket connection
let land;
let player;
let enemies;
let currentSpeed = 0;
let cursors;

function create () {
  socket = io.connect();

  // Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-500, -500, 1000, 1000);

  // Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 800, 600, 'earth');
  land.fixedToCamera = true;

  // The base of our player
  const startX = Math.round(Math.random() * (1000) - 500);
  const startY = Math.round(Math.random() * (1000) - 500);
  player = game.add.sprite(startX, startY, 'dude');
  player.anchor.setTo(0.5, 0.5);
  player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
  player.animations.add('stop', [3], 20, true);

  // This will force it to decelerate and limit its speed
  // player.body.drag.setTo(200, 200)
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.maxVelocity.setTo(400, 400);
  player.body.collideWorldBounds = true;

  // Create some baddies to waste :)
  enemies = [];

  player.bringToTop();

  game.camera.follow(player);
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);

  cursors = game.input.keyboard.createCursorKeys();

  // Start listening for events
  setEventHandlers();
}

const setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected);

  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect);

  // New player message received
  socket.on('new player', onNewPlayer);

  // Player move message received
  socket.on('move player', onMovePlayer);

  // Player removed message received
  socket.on('remove player', onRemovePlayer);
}

// Socket connected
function onSocketConnected () {
  console.log('Connected to socket server');

  // Reset enemies on reconnect
  enemies.forEach(function (enemy) {
    enemy.player.kill();
  })
  enemies = [];

  // Send local player data to the game server
  socket.emit('new player', { x: player.x, y: player.y });
}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server');
}

// New player
function onNewPlayer (data) {
  console.log('New player connected:', data.id);

  // Avoid possible duplicate players
  const duplicate = playerById(data.id);
  if (duplicate) {
    console.log('Duplicate player!');
    return;
  }

  // Add new player to the remote players array
  enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y));
}

// Move player
function onMovePlayer (data) {
  const movePlayer = playerById(data.id);

  // Player not found
  if (!movePlayer) {
    console.log('Player not found: ', data.id);
    return;
  }

  // Update player position
  movePlayer.player.x = data.x;
  movePlayer.player.y = data.y;
}

// Remove player
function onRemovePlayer (data) {
  const removePlayer = playerById(data.id);

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id);
    return;
  }

  removePlayer.player.kill();

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1);
}

function update () {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].alive) {
      enemies[i].update();
      game.physics.arcade.collide(player, enemies[i].player);
    }
  }

  if (cursors.left.isDown) {
    player.angle -= 4;
  } else if (cursors.right.isDown) {
    player.angle += 4;
  }

  if (cursors.up.isDown) {
    // The speed we'll travel at
    currentSpeed = 300;
  } else {
    if (currentSpeed > 0) {
      currentSpeed -= 4;
    }
  }

  game.physics.arcade.velocityFromRotation(player.rotation, currentSpeed, player.body.velocity);

  if (currentSpeed > 0) {
    player.animations.play('move');
  } else {
    player.animations.play('stop');
  }

  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;

  if (game.input.activePointer.isDown) {
    if (game.physics.arcade.distanceToPointer(player) >= 10) {
      currentSpeed = 300;

      player.rotation = game.physics.arcade.angleToPointer(player);
    }
  }

  socket.emit('move player', { x: player.x, y: player.y });
}

function render () {

}

// Find player by ID
function playerById (id) {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i];
    }
  }
  return false;
}
