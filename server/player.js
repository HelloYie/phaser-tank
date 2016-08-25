/* ************************************************
** GAME PLAYER CLASS
************************************************ */

'use strict';

const Player = function (startX, startY, _angle, _name) {
  let x = startX;
  let y = startY;
  let angle = _angle;
  let name = _name;
  let id;

  // Getters and setters
  const getX = () => {
    return x;
  };

  const getY = () => {
    return y;
  };

  const setX = (newX) => {
    x = newX;
  };

  const setY = (newY) => {
    y = newY;
  };

  const getAngle = () => {
    return angle;
  };

  const setAngle = (newAngle) => {
    angle = newAngle;
  };

  const getName = () => {
    return name;
  };

  const setName = (newName) => {
    name = newName;
  };

  return {
    getX,
    getY,
    getAngle,
    getName,
    setX,
    setY,
    setAngle,
    setName,
    id,
  };
};

module.exports = Player;
