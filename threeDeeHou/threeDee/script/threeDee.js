var fps;                                    //debug fps count
var bkgrnd;                                 //document element that contains  the background image (sky etc)
var flr;                                    //document element that contains the floor image (floor tiles)
var wallDiv;                                //document element that contains the wall images (and sprites)
var viewPort;                               //document element that contains the view port
var mapSizeX;                               //X size of map
var mapSizeY;                               //Y size of map
var cellWidth;                              //pixel size of each cell in map - must be the same for ALL cells
var halfCW;                                 //half cellWidth
var cell2n;                                 //2^n value of cellWidth
var maxleft = -7200;                        //maxium left offset of background image - wrap back to 0 when exceeded
var thisleft = -4500;                       //current left edge of background image in view port - must be < 0-viewport width
var bkgrdTop = -35;                         //Top offset of background image
var topOffset = 101;                        //wall top offset
var halfVW = 698;                           //half view width (excluding borders)
var tileSize = 256;                         //Tile or cell size
var halfTS = parseInt(tileSize / 2);          //half tileSize (used for computing center of tile)
var castInc = 1;                            //increment used in stepping the ray (must be << tileSize)
var angle = 0;                              //current player angle
var angleStep = -3;                         //change in player angle per left or right rotation
var step = 60;                              //change in background image left position per left or right rotation
var viewAngle = 45;                         //degrees of view angle from center of view port to endge of view port
var q1 = 90;
var q2 = 180;
var q3 = 270;
var q4 = 360;
var pi180 = Math.PI / 180;                    //degrees to radians conversion factor
var pi8 = Math.PI / 8;
var dx, dz;                                 //deltaX and deltaZ to transform rotation point fromcenter of viewport to center of POV - Need to fix "merry-go-round" issue when rotating!
var perspectiveDepth = 768;                 //Depth of perspective
var spriteDepth0 = 640;                     //Effective 0 distance offset for sprites
var moveInc = 10;                           //Player movement multiplier
var minDistance = 127;                      //Minimu distance from wall that player can move to
var trn = 0;                                //Player turning value
var mov = 0;                                //Player movement value
var fir = 0;                                //Player fireing value
var gameEnd = 0;                            //Game over flag
var stepCounter = 0;
var enemyRotated = false;
var player = {
   health: 100,
   fullhealth: 100,
   maxHealth: 200,
   weapon: null,
   ammo: 0,
   maxAmmo: 100,
   attack: 100,
   X: 0,
   Y: 0
};

var map = {
   mapData: null,
   sizeX: 16834,
   sizeY: 16834,
   cellWidth: 256,
   cell2n: 8,
   name: "Level 1",
   horizenImage: "./img/earth360f.jpg",
   maxLeft: -7200,
   horizenStep: 60,
   floorImage: "../img/floor4.jpg",
   floorSize: 4096,
   floorDepth: 1440,
   floorLeft: 1350,
   startX: (2 * 256) + 128,
   startY: (2 * 256) + 128,
   height: 101,
   tileWidth: 256,
   initialEnemies: [
      {cx: 7, mx: 64, cy: 10, my: 192, typ: 1, id: 0, rot: 9},
      {cx: 4, mx: 128, cy: 4, my: 128, typ: 1, id: 0, rot: 2},
      {cx: 5, mx: 128, cy: 18, my: 128, typ: 1, id: 0, rot: 2}
   ]
};

var cells = [];
var walls = {};
var enemyList = [];

map.mapData = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,2,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,2,2,0,2,2,2,0,0,5,0,2,0,6,0,2,0,5,0,0,0,0,5,0,2,2,0,0,2,0,2],
  [2,0,0,0,2,2,2,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2],
  [2,2,2,2,2,2,2,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,2,0,5,0,0,0,0,0,5,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,3,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,5,0,0,4,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,2],
  [2,0,0,0,0,0,2,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,2,0,0,0,0,6,0,0,0,0,2,0,0,2,0,5,0,2,0,0,0,0,0,5,0,0,0,0,0,0,2,2,2],
  [2,0,0,5,0,0,2,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,5,0,0,0,0,0,5,0,2,0,0,2,0,0,0,2,0,5,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,2,0,5,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,5,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,5,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,5,0,0,2,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,2,3,2,0,0,0,0,0,0,0,0,2,0,5,0,0,0,2,2,2,2,2,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,5,0,0,0,0,0,5,0,2],
  [2,0,0,2,2,2,2,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,3,2,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,5,2,0,2,5,0,6,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,2,0,2,0,2,2,2,2,2,2,0,2,0,0,0,2,0,5,0,0,0,0,0,0,0,0,0,0,6,0,2],
  [2,0,0,2,0,0,0,5,0,0,0,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,0,0,0,0,2,6,2,0,3,0,0,0,0,0,0,2,0,5,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,2,2,2,0,2,2,2,2,2,2,2,2,0,0,0,2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,2,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,0,2,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,5,0,2],
  [2,0,0,2,2,2,2,3,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,2,0,0,2,0,2,0,0,5,0,0,0,0,0,0,0,2,0,0,0,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,6,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,2,0,0,2,3,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,2,0,5,0,2,0,5,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,0,0,2,0,2,2,2,2,2,2,2,2,2,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,6,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,5,0,2,0,0,0,2],
  [2,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,2,0,0,0,5,0,0,0,0,0,0,0,0,5,0,2,0,0,2,2,2,2,2,2,2,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,2],
  [2,0,0,2,0,5,0,0,6,0,0,5,0,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,0,0,0,0,0,0,0,5,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,3,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,5,0,2],
  [2,0,0,2,0,5,0,0,0,0,0,5,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,4,0,5,0,0,0,0,0,0,0,0,0,0,6,0,2,0,0,0,2],
  [2,0,0,2,2,2,2,2,3,2,2,2,2,2,0,0,2,0,0,2,2,2,2,2,2,2,0,0,2,0,5,0,2,0,0,0,5,0,0,0,2,0,5,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,0,0,2,0,0,5,0,0,2,0,0,2,0,0,0,2,0,2,2,2,2,2,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,5,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,5,0,0,2,2,3,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,2,2,2,3,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,2,0,0,2,0,5,0,2,0,0,0,5,0,0,0,2,0,5,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,5,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,3,0,0,0,0,0,0,0,5,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2],
  [2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,0,0,6,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,2,0,0,5,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,5,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,2,2,2,0,0,0,2,2,2,2,2,3,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,3,2,2,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,5,0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,5,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,5,0,0,0,0,0,0,0,0,2,0,5,0,2,0,6,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,2,2,0,5,0,0,0,0,0,5,0,2,2,0,0,0,2,2,0,0,0,2,2,2,2,3,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,2,0,0,0,2,2,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,3,2,2,2,2,2,0,0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0,3,0,5,0,2,2],
  [2,0,0,5,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,2,2,0,6,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0,0,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,2,2,2,2,2,2,0,0,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,0,0,0,2,2,0,0,0,2,2,0,0,6,0,0,0,0,0,0,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2,4,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,2,0,5,0,0,0,0,0,2,0,0,0,5,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,5,0,2,0,0,0,2,2],
  [2,2,2,4,2,2,2,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,2,0,0,0,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
  [2,0,0,6,0,0,3,0,0,2,0,0,0,0,0,0,0,2,0,5,0,0,0,0,0,5,0,0,0,0,0,0,3,0,0,0,0,0,0,0,5,0,4,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,2,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,5,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];

var typs = [
   {
      id: 1,
      fn: "kelad.gif",
      tp: true,
      top: 0,
      typ: 4,
      hp: 100,
      spd: 10,
      atkDist: 512,
      rndDist: 768,
      state: "path",
      movTyp: 0,
      trkPos: 0,
      numberOfMoves: 0,
      randomNumberOfMoves: 0,
      randomCurrentMoves: 0,
      randomAction: 0,
      trkDat: [-1, 4, 2, 30, -1, 4, 2, 30, -1, 4, 2, 30, -1, 4, 2, 30]
   }
];

var cells = [
   {
      typ: 0,   //empty cell
      tp: true  //can see through empty cells
   },
   {
      typ: 1,
      fn: "wall2.jpg",
      tp: false
   },
   {
      typ: 1,
      fn: "wall3.jpg",
      tp: false
   },
   {
      typ: 1,
      fn: "wall3 door.jpg",
      tp: false
   },
   {
      typ: 1,
      fn: "wall3 window.jpg",
      tp: false
   },
   {
      typ: 3,
      fn: "kelad.gif",
      tp: true,
      mx: 128,
      my: 128
   },
   {
      typ: 4,
      fn: "kebab1.png",
      tp: true,
      mx: 128,
      my: 128,
      top: 450,
      restoreHealth: 20,
      action: healthPack
   },
   {
      typ: 0,
      fn: "wall3 door open.png",
      tp: true
   },
   {
      typ: 4,
      fn: "kebab2.png",
      tp: true,
      mx: 128,
      my: 128,
      top: 450,
      restoreHealth: 20,
      restoreFullHealth: 50,
      action: turboHealthPack
   },
   {
      typ: 4,
      fn: "drink.jpg",
      tp: true,
      mx: 128,
      my: 128,
      ammo: 20,
      action: ammoPack
   }
];

var startEnemyId = 100;

function copy(o) {
   var i;
   var res = {};
   for (v in o) res[v] = o[v];
   return res;
}

function randomMove(enemy, id) {
   if (enemyRotated) {
      moveEnemyForwards(enemy, id);
      if (enemy.randomCurrentMoves === enemy.randomNumberOfMoves) {
         enemyRotated = false;
      }
   }

   if (enemy.randomAction === 1) {
      rotate(enemy, enemy.randomAction);
      enemyRotated = true;
   }

   enemy.randomCurrentMoves++;
}

function moveEnemies() {
   var enemy, enemyAngle, enemyRotation;

   for (var i = 100; i < cells.length; i++) {
      var distance;
      enemy = cells[i];
      var action = enemy.trkDat[enemy.trkPos];
      var numberOfMoves = enemy.trkDat[enemy.trkPos + 1];
      dx = player.X - (enemy.cx * cellWidth + enemy.mx);
      dy = player.Y - (enemy.cy * cellWidth + enemy.my);
      distance = Math.sqrt((dx * dx) + (dy * dy));
      enemyAngle = InvTan(dx, dy);
      enemyRotation = angle - enemyAngle;
      if (enemyRotation < 0) {
         enemyRotation += 360;
      }
      if (enemyRotation>= 360) {
         enemyRotation -= 360;
      }
      if (distance <= enemy.atkDist) {
         enemy.rot = enemyRotation;
         moveEnemyForwards(enemy, i);
         enemy.state = "random";
      } else {
         if (enemy.state === "path") {
            if (action === 2) {
               moveEnemyForwards(enemy, i);
            } else {
               rotate(enemy, action);
            }
         } else if (enemy.state === "random") {
            if (enemy.randomNumberOfMoves === 0) {
               enemy.randomNumberOfMoves = Math.floor((Math.random() * 10) + 1);
            }

            if (enemy.randomCurrentMoves === enemy.randomNumberOfMoves) {
               enemy.randomNumberOfMoves = Math.floor((Math.random() * 15) + 1);
               enemy.randomCurrentMoves = 0;
               enemy.randomAction = Math.floor((Math.random() * 4) - 1);
            }

            randomMove(enemy, i);
         }
      }
      enemy.numberOfMoves++;

      if (enemy.numberOfMoves == numberOfMoves) {
         enemy.trkPos += 2;
         if (enemy.trkPos >= enemy.trkDat.length) {
            enemy.trkPos = 0;
         }
         enemy.numberOfMoves = 0;
      }
   }
}

function moveEnemyForwards(enemy, id) {
   map.mapData[enemy.cx][enemy.cy] = 0;
   dx = -Math.sin((enemy.rot - 1) * pi8) * enemy.spd;
   dy = Math.cos((enemy.rot - 1) * pi8) * enemy.spd;

   if (dx > 0) {
      if ((enemy.mx + dx) > halfCW) {
         if (map.mapData[enemy.cx + 1][enemy.cy] === 0) {
            if ((enemy.mx + dx) > cellWidth) {
               enemy.mx += dx - cellWidth;
               enemy.cx += 1;
            } else {
               enemy.mx += dx;
            }
         }
      } else {
         enemy.mx += dx;
      }
   } else {
      if ((enemy.mx + dx) < halfCW) {
         if (map.mapData[enemy.cx - 1][enemy.cy] === 0) {
            if ((enemy.mx + dx) < 0) {
               enemy.mx += dx + cellWidth;
               enemy.cx -= 1;
            } else {
               enemy.mx += dx;
            }
         }
      } else {
         enemy.mx += dx;
      }
   }

   if (dy > 0) {
      if ((enemy.my + dy) > halfCW) {
         if (map.mapData[enemy.cx][enemy.cy + 1] === 0) {
            if ((enemy.my + dy) > cellWidth) {
               enemy.my += dy - cellWidth;
               enemy.cy += 1;
            } else {
               enemy.my += dy;
            }
         }
      } else {
         enemy.my += dy;
      }
   } else {
      if ((enemy.my + dy) < halfCW) {
         if (map.mapData[enemy.cx][enemy.cy - 1] === 0) {
            if ((enemy.my + dy) < 0) {
               enemy.my += dy + cellWidth;
               enemy.cy -= 1;
            } else {
               enemy.my += dy;
            }
         }
      } else {
         enemy.my += dy;
      }
   }
   map.mapData[enemy.cx][enemy.cy] = id;
}

function rotate(enemy, action) {
   enemy.rot += action;
   if (enemy.rot < 1) {
      enemy.rot += 16;
   }
   if (enemy.rot > 16) {
      enemy.rot -= 16;
   }
}

function setup() {
   var i;
   //create image
   fps = document.getElementById("fps");
   viewPort = document.getElementById("view");
   viewPort.style.perspective = perspectiveDepth + "px";
   bkgrnd = document.createElement("IMG");
   bkgrnd.className = "backgroundView";
   bkgrnd.src = "./img/farfield.jpg";
   viewPort.appendChild(bkgrnd);
   flr = document.createElement("DIV");
   flr.className = "floor";
   viewPort.appendChild(flr);
   wallDiv = document.createElement("DIV");
   wallDiv.className = "walls";
   viewPort.appendChild(wallDiv);

   mapSizeX = map.sizeX;
   mapSizeY = map.sizeY;
   cellWidth = map.cellWidth;
   halfCW = cellWidth / 2;
   cell2n = map.cell2n;
   player.X = map.startX;
   player.Y = map.startY;
   enemyList = map.initialEnemies;
   for (i = 0; i < enemyList.length; i++) {
      thisEnemy = enemyList[i];
      cells[startEnemyId] = copy(typs[thisEnemy.id]);
      cells[startEnemyId].mx = thisEnemy.mx;
      cells[startEnemyId].my = thisEnemy.my;
      cells[startEnemyId].cx = thisEnemy.cx;
      cells[startEnemyId].cy = thisEnemy.cy;
      cells[startEnemyId].rot = thisEnemy.rot;
      map.mapData[thisEnemy.cx][thisEnemy.cy] = startEnemyId++;
   }
   updateview();
   //setup keys
   document.body.addEventListener("keydown", keyDnHndlr, false);
   document.body.addEventListener("keyup", keyUpHndlr, false);
   document.body.addEventListener("blur", keyClear, false);
   document.body.addEventListener("focusout", keyClear, false);
   document.body.addEventListener("mouseleave ", keyClear, false);
   setInterval(gameLoop, 10);
}

function keyClear(e) {
   trn = 0;
   mov = 0;
   fir = 0;
}

function keyDnHndlr(e) {
   var kc = e.keyCode;
   if (kc == 37) {
      trn = 1;
   }
   if (kc == 38) {
      mov = 1;
   }
   if (kc == 39) {
      trn = -1;
   }
   if (kc == 40) {
      mov = -1;
   }
   if (kc == 32) {
      fir = 1;
   }
   if (kc == 13) {
      gameEnd = 1;
   }
   if (kc == 69) {
      openDoor();
   }
}

function keyUpHndlr(e) {
   var kc = e.keyCode;
   if (kc == 37) {
      trn = 0;
   }
   if (kc == 38) {
      mov = 0;
   }
   if (kc == 39) {
      trn = 0;
   }
   if (kc == 40) {
      mov = 0;
   }
   if (kc == 32) {
      fir = 0;
   }
}

function openDoor() {
   var mcx, mcy;
   mcx = player.X >>> cell2n;
   mcy = player.Y >>> cell2n;
   if (map.mapData[mcx][mcy + 1] === 3) { // Change to door
      map.mapData[mcx][mcy + 1] = 7;
   }
   if (map.mapData[mcx][mcy - 1] === 3) { // Change to door
      map.mapData[mcx][mcy - 1] = 7;
   }
   if (map.mapData[mcx + 1][mcy] === 3) { // Change to door
      map.mapData[mcx + 1][mcy] = 7;
   }
   if (map.mapData[mcx - 1][mcy] === 3) { // Change to door
      map.mapData[mcx - 1][mcy] = 7;
   }
}

function healthPack() {
   player.health += this.restoreHealth;
   if (player.health > player.fullhealth) {
      player.health = player.fullhealth;
   }
   if (player.fullhealth > player.maxHealth) {
      player.fullhealth = player.maxHealth;
   }
}

function turboHealthPack() {
   player.health += this.restoreHealth;
   player.fullhealth += this.restoreFullHealth;
   if (player.health > player.fullhealth) {
      player.health = player.fullhealth;
   }
   if (player.fullhealth > player.maxHealth) {
      player.fullhealth = player.maxHealth;
   }
}

function ammoPack() {
   player.ammo += this.ammo;
   if (player.ammo > player.maxAmmo) {
      player.ammo = player.maxAmmo;
   }
}

function weapon() {
   if (player.weapon === null) {
      player.weapon = this.weapon;
      player.ammo = this.ammo;
   } else {
     player.ammo += this.ammo;
      if (player.ammo > player.maxAmmo) {
         player.ammo = player.maxAmmo;
      }
   }
}

function updateview() {
   var playerModX, playerModY;
   bkgrnd.style.left = thisleft + "px";
   bkgrnd.style.top = bkgrdTop + "px";
   playerModX = player.X - 2048;   // % cellWidth;
   playerModY = player.Y - 2048;   // % cellWidth;
   dx = parseInt(perspectiveDepth * Math.sin(angle * pi180));
   dz = parseInt(perspectiveDepth * Math.cos(angle * pi180));
   var tempX = (-dx - playerModX) % 512;
   var tempZ = (dz + playerModY) % 512;
   flr.style.transform = 'rotatey(' + angle + 'deg) rotatex(90deg) translateZ(2450px) translateX(' + tempX + 'px)  translateY(' + tempZ + 'px) ';
   rayCast();
   render();
}

function doMove() {
   var movDir, newMapX, newMapY;
   var mcx, mcy, CMC, CMCcell;
   var playerDX, playerDY;

   if (trn != 0) {
      thisleft += trn * step;
      angle += trn * angleStep;
      angle = (angle + q4) % q4; //make sure it is in range 0-360
      if (thisleft < maxleft) {
         thisleft -= maxleft;
      } else if (thisleft > 0) {
         thisleft = maxleft + thisleft;
      }
   }
   if (mov != 0) {
      //compute dx and dy
      if (mov > 0) {
         movDir = moveInc;
      } else {
         movDir = -moveInc;
      }

      playerDX = Math.sin(angle * pi180) * movDir;
      playerDY = Math.cos(angle * pi180) * movDir;
      mapX = player.X;
      mapY = player.Y;
      if (playerDX != 0) {
         if (playerDX < 0) {
            newMapX = mapX + playerDX - minDistance;
         } else {
            newMapX = mapX + playerDX + minDistance;
         }
         mcx = newMapX >>> cell2n;
         mcy = mapY >>> cell2n;
         CMC = map.mapData[mcx][mcy];
         CMCcell = cells[CMC];
         if (CMC && (CMCcell.typ == 1)) {
            if (playerDX < 0) {
               player.X = parseInt(((mcx + 1) << cell2n) + minDistance);
            } else {
               player.X = parseInt((mcx << cell2n) - minDistance);
            }
         }
         else {
            player.X = mapX + playerDX;
         }
      }

      if (playerDY != 0) {
         if (playerDY < 0) {
            newMapY = mapY + playerDY - minDistance;
         } else {
            newMapY = mapY + playerDY + minDistance;
         }
         mcx = mapX >>> cell2n;
         mcy = newMapY >>> cell2n;
         CMC = map.mapData[mcx][mcy];
         CMCcell = cells[CMC];
         if (CMC && (CMCcell.typ == 1)) {
            if (playerDY < 0) {
               player.Y = parseInt(((mcy + 1) << cell2n) + minDistance);
            } else {
               player.Y = parseInt((mcy << cell2n) - minDistance);
            }
         } else if (CMCcell.typ == 4) {
            cells[CMC].action();
            map.mapData[mcx][mcy] = 0;
         }
         else {
            player.Y = mapY + playerDY;
         }
      }

//    console.log("Pos -> "+player.X+", "+player.Y+", "+playerDX+", "+playerDY);

   }
   if (fir != 0) {
      //check frequency
      //check for type of attack
      //add to bullet list

   }
}

var fpsc = 0;
var ts = 0;

function gameLoop() {
   var tsnow = new Date().getSeconds();
   if (ts != tsnow) {
      fps.innerHTML = fpsc + "fps";
      fpsc = 0;
   }
   else {
      fpsc++;
   }
   ts = tsnow;
   doMove();
   //check for respawn
   //update any player bullets
   //check for enemy death
   //update position, rotation and attack of enemies
   if (stepCounter++ === 3) {
      moveEnemies();
      stepCounter = 0;
   }
   //check for game end (end of level / player death)
   //check for power ups / weapons / ammo
   updateview();
   //update status bar
}

function render() {
   var i, wli, tX, tZ;
   var wll = wallList.length;
   wallDiv.innerHTML = ""; //remove old wall segments

   for (i = 0; i < wll; i++) {
      wli = wallList[i];
      if (wli.typ > 2) {
         wli.div = document.createElement("DIV");
         wli.div.className = "clipImg";
         wli.div.style.left = halfVW - wli.W + "px";
         wli.img = document.createElement("IMG");
         wli.img.className = "wallTile";
         wli.img.style.top = wli.top + "px";
         wli.img.src = "./img/" + wli.fn;
         wli.img.className = wli.CN;
         wli.div.appendChild(wli.img);
         //compute dX from angle and spriteDepth0
         tX = wli.X;// - dx;
         tZ = -wli.Z;// - dz; //+spriteDepth0);
         wli.div.style.transform = 'rotatey(' + wli.R + 'deg) rotatex(0deg) translateX(' + tX + 'px) translateY(' + topOffset + 'px) translateZ(' + tZ + 'px)';
         wallDiv.appendChild(wli.div);
      }
      else {
         wli.img = document.createElement("IMG");
         wli.img.className = "wallTile";
         wli.img.src = "./img/" + wli.fn;

         wli.img.style.left = halfVW - wli.W + "px";
         if (wli.R) {
            ang = angle + q1;
            tX = wli.X - dx;
            tZ = wli.Z - dz;
            wli.img.style.transform = 'rotatey(' + ang + 'deg) rotatex(0deg) translateX(' + tZ + 'px) translateY(' + topOffset + 'px) translateZ(' + tX + 'px)';
         }
         else {
            tX = wli.X - dx;
            tZ = -wli.Z + dz;
            wli.img.style.transform = 'rotatey(' + angle + 'deg) rotatex(0deg) translateX(' + tX + 'px) translateY(' + topOffset + 'px) translateZ(' + tZ + 'px)';
         }
         wallDiv.appendChild(wli.img);
      }
   }
}

function InvTan(dx, dy) {
   var theta;
   if (dy == 0) {
      theta = (dx < 0) ? q3 : q1;
   } else {
      if (dx > 0) {
         if (dy > 0) {
            theta = Math.atan(dx / dy) / pi180;
         } else {
            theta = q2 + Math.atan(dx / dy) / pi180;
         }
      }
      else {
         if (dy > 0) {
            theta = q4 + Math.atan(dx / dy) / pi180;
         } else {
            theta = q2 + Math.atan(dx / dy) / pi180;
         }
      }
   }
   return theta;
}

function rayCast() {
   var dX, dY, mapX, mapY, oldx, oldy, mcx, mcy;
   var unRotDX, unRotDY, rotDX, rotDY;
   var CMC, CMCcell;
   var clockwise, oldClock;
   var deltaX, deltaY, dist, theta;
   var dat;
   var cornerRayX, cornerRayY, cornerRayAngle;
   var nextCornerRayX, nextCornerRayY, nextCornerRayAngle;
   var spriteAng, spriteRot;

   var currList = [];
   var rayStep = viewAngle / halfVW;
   var startRay = angle - viewAngle;
   var endRay = angle + viewAngle;
   var countRay = startRay % q4;
   var currentRay = countRay;

   if (currentRay < 0) {
      countRay += q4;
      currentRay += q4;
      endRay += q4;
   }
   wallList = [];
   oldx = -1;
   oldy = -1;

   var rayCastCount = 0;
   do {
      if (currentRay < q1) {
         cornerDX = 0;
         cornerDY = 0;
         rotClock = false;
         rotAnti = true;
         clockWallDeltaX = halfCW;
         clockWallDeltaY = 0;
         antiWallDeltaX = 0;
         antiWallDeltaY = halfCW;
         nextConerX = cellWidth;
         nextConerY = 0;
         prevConerX = 0;
         prevConerY = cellWidth;
      }
      else if (currentRay < q2) {
         cornerDX = 0;
         cornerDY = cellWidth;
         rotClock = true;
         rotAnti = false;
         clockWallDeltaX = 0;
         clockWallDeltaY = halfCW;
         antiWallDeltaX = halfCW;
         antiWallDeltaY = cellWidth;
         nextConerX = 0;
         nextConerY = 0;
         prevConerX = cellWidth;
         prevConerY = cellWidth;
      }
      else if (currentRay < q3) {
         cornerDX = cellWidth;
         cornerDY = cellWidth;
         rotClock = false;
         rotAnti = true;
         clockWallDeltaX = halfCW;
         clockWallDeltaY = cellWidth;
         antiWallDeltaX = cellWidth;
         antiWallDeltaY = halfCW;
         nextConerX = 0;
         nextConerY = cellWidth;
         prevConerX = cellWidth;
         prevConerY = 0;
      }
      else {
         cornerDX = cellWidth;
         cornerDY = 0;
         rotClock = true;
         rotAnti = false;
         clockWallDeltaX = cellWidth;
         clockWallDeltaY = halfCW;
         antiWallDeltaX = halfCW;
         antiWallDeltaY = 0;
         nextConerX = cellWidth;
         nextConerY = cellWidth;
         prevConerX = 0;
         prevConerY = 0;
      }
      dX = Math.sin(currentRay * pi180) * castInc;
      dY = Math.cos(currentRay * pi180) * castInc;
      mapX = player.X;
      mapY = player.Y;
      do {
         mapX += dX;
         mapY += dY;
         mcx = mapX >>> cell2n;
         mcy = mapY >>> cell2n;
         if ((mapX < 0) || (mapY < 0) || (mapX > mapSizeX) || (mapY > mapSizeY)) {
            break;
         }
         CMC = map.mapData[mcx][mcy];
         CMCcell = cells[CMC];

         if (CMC) {
            if (CMCcell.typ < 3) { //wall or door
               cornerRayX = mcx * cellWidth + cornerDX - player.X;
               cornerRayY = mcy * cellWidth + cornerDY - player.Y;
               cornerRayAngle = InvTan(cornerRayX, cornerRayY);
               if ((currentRay > q3) && (cornerRayAngle < q1)) {
                  cornerRayAngle += q4;
               }//if they are reversed
               else if ((cornerRayAngle > q3) && (currentRay < q1)) {
                  cornerRayAngle -= q4;
               } //if they are reversed
               clockwise = (cornerRayAngle < currentRay);

               //console.log("CMC -> "+mcx+", "+mcy+", cr="+currentRay+", cra="+cornerRayAngle+", clock="+clockwise);

               if ((oldx == mcx) && (oldy == mcy) && (clockwise == oldClock) && CMCcell && !CMCcell.tp) {
                  break;
               }
               if ((oldx == mcx) && (oldy == mcy) && (clockwise == oldClock)) {
                  continue;
               }
               oldx = mcx;
               oldy = mcy;
               oldClock = clockwise;

               if (clockwise) {
                  //clock
                  deltaX = player.X - mcx * cellWidth - clockWallDeltaX;
                  deltaY = player.Y - mcy * cellWidth - clockWallDeltaY;
                  if (!currList[deltaX]) {
                     currList[deltaX] = [];
                  }
                  if (!currList[deltaX][deltaY]) {
                     currList[deltaX][deltaY] = true;
                     dat = {};
                     //clock
                     dat.R = rotClock;
                     dat.X = -deltaX;
                     dat.Z = -deltaY;
                     dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                     dat.W = halfCW;
                     dat.fn = CMCcell.fn;
                     dat.typ = CMCcell.typ;
                     wallList.push(dat);
                  }
               }
               else {
                  deltaX = player.X - mcx * cellWidth - antiWallDeltaX;
                  deltaY = player.Y - mcy * cellWidth - antiWallDeltaY;
                  if (!currList[deltaX]) {
                     currList[deltaX] = [];
                  }
                  if (!currList[deltaX][deltaY]) {
                     currList[deltaX][deltaY] = true;
                     dat = {};
                     //counterClock
                     dat.R = rotAnti;
                     dat.X = -deltaX;
                     dat.Z = -deltaY;
                     dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                     dat.W = halfCW;
                     dat.fn = CMCcell.fn;
                     dat.typ = CMCcell.typ;
                     wallList.push(dat);
                  }
               }
            }
            else { //sprite
               //compute actual dx, dy
               deltaX = (mcx * cellWidth + CMCcell.mx) - player.X;
               deltaY = (mcy * cellWidth + CMCcell.my) - player.Y;
               dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
               //check if already added to wall list
               if (!currList[deltaX]) {
                  currList[deltaX] = [];
               }
               if (!currList[deltaX][deltaY]) {
                  currList[deltaX][deltaY] = true;
                  //compute angle from sprite dx, dy
                  spriteAng = InvTan(deltaX, deltaY);
                  theta = angle - spriteAng;
                  if (theta < 0) {
                     theta += 360;
                  }
                  if (theta >= 360) {
                     theta -= 360;
                  }
                  if ((theta < 50) || (theta > 310)) {
                     //compute dX, dZ from angle of sprite - veiw port center angle
                     var adj = Math.sin(theta * pi180) * 750;
                     var hyp = Math.sqrt(adj * adj + 250 * 250);

                     if (CMCcell.rot != undefined) {
                        spriteRot = CMCcell.rot + (spriteAng + 11.75) / 22.5 - 8;
                        if (spriteRot < 1) {
                           spriteRot += 16;
                        }
                        if (spriteRot > 16) {
                           spriteRot -= 16;
                        }
                        spriteRot = parseInt(spriteRot);
                     }
                     else {
                        spriteRot = false;
                     }

                     //add to wall list
                     dat = {};
                     dat.R = theta;
                     dat.X = -adj;
                     dat.Z = -1100 + dist + hyp;
                     dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                     dat.W = halfCW;
                     dat.fn = CMCcell.fn;
                     dat.typ = CMCcell.typ;
                     dat.top = CMCcell.top;
                     if (spriteRot) {
                        dat.CN = "rot" + spriteRot;
                     }
                     wallList.push(dat);
                  }
               }
            }
         }
         if (CMCcell && !CMCcell.tp) {
            //compute next ray
            //if anticlock, then just set currentRay = cornerRay
            //else compute nextCornerRay and set current ray to that
            if (!clockwise) {
               if (cornerRayAngle >= countRay) {
                  countRay = cornerRayAngle;
               }
               else {
                  countRay = cornerRayAngle + q4;
               }
            }
            else {
               //compute nextCornerRay
               nextCornerRayX = mcx * cellWidth + nextConerX - player.X;
               nextCornerRayY = mcy * cellWidth + nextConerY - player.Y;
               nextCornerRayAngle = InvTan(nextCornerRayX, nextCornerRayY);
               if ((countRay > nextCornerRayAngle)) {
                  nextCornerRayAngle += q4;
               } //if they are reversed
               countRay = nextCornerRayAngle;
            }
            break;
         }
      }
      while (true);
      countRay += rayStep;
      currentRay = countRay % q4;

      rayCastCount++;
//console.log("frwrd rayCastCount -> "+rayCastCount);
      rayCastCount = 0;
   }
   while (countRay < endRay);

   startRay = angle - viewAngle;
   endRay = angle + viewAngle;
   countRay = endRay;
   currentRay = countRay;
   if (currentRay >= q4) {
      countRay -= q4;
      currentRay -= q4;
      startRay -= q4;
   }
   oldx = -1;
   oldy = -1;

   do {
      if (currentRay < 0) {
         cornerDX = cellWidth;
         cornerDY = 0;
         rotClock = true;
         rotAnti = false;
         clockWallDeltaX = cellWidth;
         clockWallDeltaY = halfCW;
         antiWallDeltaX = halfCW;
         antiWallDeltaY = 0;
         nextConerX = cellWidth;
         nextConerY = cellWidth;
         prevConerX = 0;
         prevConerY = 0;
      }
      else if (currentRay < q1) {
         cornerDX = 0;
         cornerDY = 0;
         rotClock = false;
         rotAnti = true;
         clockWallDeltaX = halfCW;
         clockWallDeltaY = 0;
         antiWallDeltaX = 0;
         antiWallDeltaY = halfCW;
         nextConerX = cellWidth;
         nextConerY = 0;
         prevConerX = 0;
         prevConerY = cellWidth;
      }
      else if (currentRay < q2) {
         cornerDX = 0;
         cornerDY = cellWidth;
         rotClock = true;
         rotAnti = false;
         clockWallDeltaX = 0;
         clockWallDeltaY = halfCW;
         antiWallDeltaX = halfCW;
         antiWallDeltaY = cellWidth;
         nextConerX = 0;
         nextConerY = 0;
         prevConerX = cellWidth;
         prevConerY = cellWidth;
      }
      else if (currentRay < q3) {
         cornerDX = cellWidth;
         cornerDY = cellWidth;
         rotClock = false;
         rotAnti = true;
         clockWallDeltaX = halfCW;
         clockWallDeltaY = cellWidth;
         antiWallDeltaX = cellWidth;
         antiWallDeltaY = halfCW;
         nextConerX = 0;
         nextConerY = cellWidth;
         prevConerX = cellWidth;
         prevConerY = 0;
      }
      else {
         cornerDX = cellWidth;
         cornerDY = 0;
         rotClock = true;
         rotAnti = false;
         clockWallDeltaX = cellWidth;
         clockWallDeltaY = halfCW;
         antiWallDeltaX = halfCW;
         antiWallDeltaY = 0;
         nextConerX = cellWidth;
         nextConerY = cellWidth;
         prevConerX = 0;
         prevConerY = 0;
      }
      dX = Math.sin(currentRay * pi180) * castInc;
      dY = Math.cos(currentRay * pi180) * castInc;
      mapX = player.X;
      mapY = player.Y;
      do {
         mapX += dX;
         mapY += dY;
         mcx = mapX >>> cell2n;
         mcy = mapY >>> cell2n;
         if ((mapX < 0) || (mapY < 0) || (mapX > mapSizeX) || (mapY > mapSizeY)) {
            break;
         }
         CMC = map.mapData[mcx][mcy];
         CMCcell = cells[CMC];

         if (CMC) {
            if (CMCcell.typ < 3) { //wall or door
               cornerRayX = mcx * cellWidth + cornerDX - player.X;
               cornerRayY = mcy * cellWidth + cornerDY - player.Y;
               cornerRayAngle = InvTan(cornerRayX, cornerRayY);
               if ((currentRay > q3) && (cornerRayAngle < q1)) {
                  cornerRayAngle += q4;
               }//if they are reversed
               else if ((cornerRayAngle > q3) && (currentRay < q1)) {
                  cornerRayAngle -= q4;
               } //if they are reversed
               clockwise = (cornerRayAngle < currentRay);

               if ((oldx == mcx) && (oldy == mcy) && (clockwise == oldClock) && CMCcell && !CMCcell.tp) {
                  break;
               }
               if ((oldx == mcx) && (oldy == mcy) && (clockwise == oldClock)) {
                  continue;
               }

               //console.log("CMC -> "+mcx+", "+mcy+", cr="+currentRay+", cra="+cornerRayAngle+", clock="+clockwise);

               oldx = mcx;
               oldy = mcy;
               oldClock = clockwise;

               if (clockwise) {
                  //clock
                  deltaX = player.X - mcx * cellWidth - clockWallDeltaX;
                  deltaY = player.Y - mcy * cellWidth - clockWallDeltaY;
                  if (!currList[deltaX]) {
                     currList[deltaX] = [];
                  }
                  if (!currList[deltaX][deltaY]) {
                     currList[deltaX][deltaY] = true;
                     dat = {};
                     //clock
                     dat.R = rotClock;
                     dat.X = -deltaX;
                     dat.Z = -deltaY;
                     dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                     dat.W = halfCW;
                     dat.fn = CMCcell.fn;
                     dat.typ = CMCcell.typ;
                     if (CMCcell.rot) {
                        dat.CN = "rot" + CMCcell.rot;
                     }
                     wallList.push(dat);
                  }
               }
               else {
                  deltaX = player.X - mcx * cellWidth - antiWallDeltaX;
                  deltaY = player.Y - mcy * cellWidth - antiWallDeltaY;
                  if (!currList[deltaX]) {
                     currList[deltaX] = [];
                  }
                  if (!currList[deltaX][deltaY]) {
                     currList[deltaX][deltaY] = true;
                     dat = {};
                     //counterClock
                     dat.R = rotAnti;
                     dat.X = -deltaX;
                     dat.Z = -deltaY;
                     dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                     dat.W = halfCW;
                     dat.fn = CMCcell.fn;
                     dat.typ = CMCcell.typ;
                     if (CMCcell.rot) {
                        dat.CN = "rot" + CMCcell.rot;
                     }
                     wallList.push(dat);
                  }
               }
               //console.log("RC -> "+mcx+", "+mcy+", a="+currentRay+", r="+dat.R);
            }
         }
         else { //sprite

         }
         if (CMCcell && !CMCcell.tp) {
            //compute next ray
            //if anticlock, then just set currentRay = cornerRay
            //else compute prevCornerRay and set current ray to that
            if (clockwise) {
               if (countRay > cornerRayAngle) {
                  countRay = cornerRayAngle;
               }
               else {
                  countRay = cornerRayAngle - q4;
               }
            }
            else {
               //compute prevCornerRay
               prevCornerRayX = mcx * cellWidth + prevConerX - player.X;
               prevCornerRayY = mcy * cellWidth + prevConerY - player.Y;
               prevCornerRayAngle = InvTan(prevCornerRayX, prevCornerRayY);
               if ((countRay < prevCornerRayAngle)) {
                  prevCornerRayAngle -= q4;
               } //if they are reversed
               countRay = prevCornerRayAngle;

            }
            break;
         }
      }
      while (true);
      countRay -= rayStep;
      currentRay = countRay % q4;

      rayCastCount++;

   }
   while (countRay > startRay);

//console.log("back rayCastCount -> "+rayCastCount);

   //sprite code
   /*
     dat = {};
     dat.X = 0;
     dat.Z = 1024;
     dat.D = 1;
     dat.W = halfCW;
     dat.fn = "kelad.gif";
     dat.CN = "rot0"//+rotCnt++;
     if(rotCnt>90) rotCnt=1;
     dat.R = rotCnt++-45;
     dat.X = -dat.R*11.11;
     dat.typ = 2;
     wallList.push(dat);
   */
   wallList = wallList.sort(sortRay);
}

function sortRay(a, b) {
   return b.D - a.D;
}

window.onload = setup;