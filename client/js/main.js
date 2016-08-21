/**
 * @summ 游戏主入口
 * @desc  负责绘制整个游戏, 并监听socket
 */

/*eslint-disable */

import 'pixi.js';
import 'p2';
import 'phaser';
import 'socket.io-client';
import RemotePlayer from './RemotePlayer';
import lightSandPng from  'assets/light_sand.png';
import knife1 from  'assets/knife1.png';
import dudePng from  'assets/dude.png';

import 'css/reset.css';
import 'css/game.css';

let socket; // Socket connection
let land;
let player; // current plaery
let gamers; // other remote players
let bullets;
let bullet;
let currentSpeed = 0;
let cursors;
let weapon;


const game = new Phaser.Game(
  800,
  600,
  Phaser.AUTO,
  '',
  {
    preload,
    create,
    update,
    render,
  }
);

function preload () {
  game.load.image('earth', lightSandPng);
  game.load.image('knife1', knife1);
  game.load.spritesheet('dude', dudePng, 64, 64);
  game.load.spritesheet('enemy', dudePng, 64, 64);
}

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

  // 初始化子弹数据
  weapon = game.add.weapon(5, 'knife1');

  //  The bullet will be automatically killed when it leaves the world bounds
  weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

  //  Because our bullet is drawn facing up, we need to offset its rotation:
  weapon.bulletAngleOffset = 90;

  //  The speed at which the bullet is fired
  weapon.bulletSpeed = 400;

  //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
  weapon.fireRate = 500;
  weapon.trackSprite(player, 0, 0, true);

  // Create some baddies to waste :)
  gamers = {};

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

  // shot message received
  socket.on('shot', onShot);
};

// Socket connected
function onSocketConnected () {
  console.log('Connected to socket server');

  // Reset gamers on reconnect
  Object.keys(gamers).forEach(function(gamerId){
    let gamerObj = gamers[gamerId];
    gamerObj.player.kill();
  });
  gamers = {};

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
  const duplicate = gamerById(data.id, true);
  if (duplicate) {
    console.log('Duplicate player!');
    return;
  }

  // Add new player to the remote players array
  gamers[data.id] = new RemotePlayer(data.id, game, player, data.x, data.y, 'red');
}

// Move player
function onMovePlayer (data) {
  const movePlayer = gamerById(data.id);

  // Player not found
  if (!movePlayer) {
    return;
  }

  // Update player position
  movePlayer.player.x = data.x;
  movePlayer.player.y = data.y;
}

// Shot
function onShot(data) {
  const gamerObj = gamerById(data.id);

  // Player not found
  if (!gamerObj) {
    return;
  }
  gamerObj.weapon.fire();
}


// Remove player
function onRemovePlayer (data) {
  const removePlayer = gamerById(data.id);

  // Player not found
  if (!removePlayer) {
    return;
  }

  removePlayer.player.kill();

  // Remove player from array
  delete gamers[data.id];
}

function update () {
  Object.keys(gamers).forEach(function(gamerId){
    let gamerObj = gamers[gamerId];
    if(gamerObj.alive){
      gamerObj.update();
      game.physics.arcade.collide(player, gamerObj.player);
    }
  });
  if (game.input.activePointer.isDown) {
    // 攻击
    weapon.fire();
    socket.emit('shot', { x: player.x, y: player.y, angle: player.angle});
  }
  else{
    // 移动
    if (cursors.left.isDown) {
      player.angle -= 4;
    } else if (cursors.right.isDown) {
      player.angle += 4;
    }

    if (cursors.up.isDown) {
      // TODO: 添加手机陀螺仪支持
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
    socket.emit('move player', { x: player.x, y: player.y });
  }
}

function render () {

}

// Find player by ID
function gamerById (id, silence=false) {
  let gamerObj = gamers[id];
  if(gamerObj){
    return gamerObj;
  }
  else{
    if(!silence){
      console.log('Player not found: ', id);
    }
    return false;
  }
}
