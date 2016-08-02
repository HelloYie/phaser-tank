/* ************************************************
** GAME PLAYER CLASS
************************************************ */
'use strict';  

const Player = function (startX, startY) {
  let x = startX;
  let y = startY;
  let id;

  // Getters and setters
  const getX = () => {
    return x;
  }

  const getY = () => {
    return y;
  }

  const setX = (newX) => {
    x = newX;
  }

  const setY = (newY) => {
    y = newY;
  }

  // Define which variables and methods can be accessed
  return {
    getX ,
    getY,
    setX,
    setY,
    id,
  };
}

module.exports = Player;
