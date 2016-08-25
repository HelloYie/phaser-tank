/**
 * @summ 游戏主入口
 * @desc  负责绘制整个游戏, 并监听socket
 */

/*eslint-disable */

import 'pixi.js';
import 'p2';
import 'phaser';
import 'socket.io-client';
import gyro from 'js/lib/gyro';

import Player from './Player';
import RemotePlayer from './RemotePlayer';
import lightSandPng from  'assets/light_sand.png';
import knife1 from  'assets/knife1.png';
import dudePng from  'assets/dude.png';

import 'css/reset.css';
import 'css/game.css';

let socket; // Socket connection
let land;
let player; // current player
let sPlayer;
let gamers; // other remote players
let playerGroup;
let bullets;
let gyroUpdated;
let currentSpeed = 0;
let cursors;
let weapon;
let update_rate = 1;
let names = [
  '丁丁',
  '东东',
  '信钊',
  '超哥',
  '一姐',
  '一哥',
  '狗二蛋',
  '王妈',
  '丁香',
  '苦瓜',
  '二麻子',
  '张三哥',
  '王小二',
  '飞飞',
  '妮妮',
  '呆妹',
  '呆哥',
  '条子',
  '山鸡',
  '浩南哥',
  '耀阳哥',
  '红孩儿'
];
let name = names[Math.floor(Math.random()*names.length)];
let name_text;

const game = new Phaser.Game(
  '100',
  '100',
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
  // Resize our game world to be a 4000 x 4000 square
  game.world.setBounds(-2000, -2000, 2000, 2000);
  // Our tiled scrolling background

  land = game.add.tileSprite(0, 0, game.width, game.height, 'earth');
  land.fixedToCamera = true;

  player = new Player(game, name,  null, 'dude' ).init();
  sPlayer = player.sPlayer;

  // 初始化子弹数据
  weapon = game.add.weapon(5, 'knife1');
  bullets = weapon.bullets;

  //  The bullet will be automatically killed when it leaves the world bounds
  weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

  //  Because our bullet is drawn facing up, we need to offset its rotation:
  weapon.bulletAngleOffset = 90;

  //  The speed at which the bullet is fired
  weapon.bulletSpeed = 400;

  //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
  weapon.fireRate = 500;
  weapon.trackSprite(sPlayer, 0, 0, true);

  // Create some baddies to waste :)
  gamers = {};

  sPlayer.bringToTop();

  game.camera.follow(sPlayer);
  game.camera.deadzone = new Phaser.Rectangle(game.width/3, game.height/3, game.width/3, game.height/3);
  game.camera.focusOnXY(0, 0);

  cursors = game.input.keyboard.createCursorKeys();

  // Start listening for events
  setEventHandlers();

  // 初始化加速度感应器
	// setting gyroscope update frequency
  gyro.frequency = 200;
  // start gyroscope detection
  gyro.startTracking(function(o) {
    // 近乎完美的重力加速度传感器体验
    // updating player velocity
    let gamma = -(o.gamma);  // x轴
    let beta = o.beta - 20;  // Y轴
    let rad = Math.atan2(gamma, beta);
    let angle = rad * (180 / Math.PI) + 90;

    gyroUpdated = false;
    if(sPlayer.angle != angle){
      sPlayer.angle = angle;
      gyroUpdated = true;
    }

    let speed = Math.max(Math.abs(gamma), Math.abs(beta)) * 14;
    if(speed < 0){
      speed = 0;
    }
    else if(speed > 350){
      speed = 350;
    }
    if(speed != currentSpeed){
      currentSpeed =  speed;
      gyroUpdated = true;
    }
  });
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

  socket.on('kill', onKill);
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
  socket.emit('new player', { x: sPlayer.x, y: sPlayer.y, angle: sPlayer.angle, name: name});
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
  let gamer = new RemotePlayer(data.id, game, sPlayer, data.x, data.y, data.name, 'blue');
  gamers[data.id] = gamer;
  playerGroup.add(gamer.player);
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
  movePlayer.player.angle = data.angle;
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

function onKill(data) {
  const removePlayer = gamerById(data.id);
  // Player not found
  if (!removePlayer) {
    console.log('not');
    return;
  }

  removePlayer.player.kill();
  console.log(removePlayer);
  // Remove player from array
  delete gamers[data.id];
}

function hitHandler(gamer, bullet){
  let bullet_owner = bullet.data.bulletManager.trackedSprite;
  if (bullet_owner.camp != gamer.camp){
    gamer.kill();
    socket.emit('kill', {id: gamer.name});
    if(gamer === sPlayer){
      // 阵亡
      name_text.kill();
    }
    else{
      gamer.manager.name_text.kill();
    }
  }
  if(bullet_owner != gamer){
    // 碰撞后子弹消失
    bullet.kill();
  }
}

function update () {
  let updated = false;
  game.physics.arcade.overlap(playerGroup, bullets, hitHandler, null, this);
  Object.keys(gamers).forEach(function(gamerId){
    let gamerObj = gamers[gamerId];
    if(gamerObj.alive){
      gamerObj.update();
      game.physics.arcade.collide(sPlayer, gamerObj.player);
      game.physics.arcade.overlap(playerGroup, gamerObj.bullets, hitHandler, null, this);
    }
    else{
      gamerObj.name_text.kill();
      gamerObj.player.kill();
    }
  });
  if (game.input.activePointer.isDown) {
    // 攻击
    if(sPlayer.alive){
      weapon.fire();
      socket.emit('shot', { x: sPlayer.x, y: sPlayer.y, angle: sPlayer.angle});
    }
  }
  else{
    // 移动
    if (cursors.left.isDown) {
      sPlayer.angle -= 4;
      updated = 1;
    } else if (cursors.right.isDown) {
      sPlayer.angle += 4;
      updated = 1;
    }

    if (cursors.up.isDown) {
      // The speed we'll travel at
      currentSpeed = 350;
      updated = 1;
    } else if(currentSpeed > 0){
        currentSpeed -= 1;
        updated = 1;
    }
  }

  if(updated || gyroUpdated){
    playerMove();
  }
}

function playerMove(){
  game.physics.arcade.velocityFromRotation(sPlayer.rotation, currentSpeed, sPlayer.body.velocity);

  if (currentSpeed > 0) {
    sPlayer.animations.play('move');
  } else {
    sPlayer.animations.play('stop');
  }

  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;
  //
  player.playerName.x = Math.floor(sPlayer.x - 25);
  player.playerName.y = Math.floor(sPlayer.y - sPlayer.height);
  if((update_rate % 3) === 0){
    // 每秒20个请求， 降低请求数
    update_rate = 1;
    socket.emit('move player', { x: sPlayer.x, y: sPlayer.y, angle: sPlayer.angle });
  }
  update_rate += 1;
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
