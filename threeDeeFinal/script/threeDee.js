var fps, background, floor, wallDiv, viewPort, map,
        mapSizeX, mapSizeY,
        mapSizeXpx, mapSizeYpx,
        cellSize, halfCW, cell2n,
        maxLeft,
        thisLeft = -4500,
        backgroundTop = -35,
        halfVW = 698,
        playerFacingAngle = 0,
        angleStep = -3,
        step = 60,
        viewAngle = 45,
        q1 = 90, q2 = 180, q3 = 270, q4 = 360,
        pi180 = Math.PI / 180,
        pi8 = Math.PI / 8,
        dx, dz,
        perspectiveDepth = 768,
        minimumDistanceFromCellBoundary = 90,
        turn = 0, move = 0, fire = 0, strafe = 0, gameEnd = 0,
        spriteLoop = 3, spriteLoopCount = 0,
        wallList = [],
        randMovCount = 0, randMovI = 0,
        miniMapCellSize,
        oldPxForMiniMap, oldPyForMiniMap,
        startEnemyId = 100, startPickupId = 50,
        enemyList = [], spriteList = [], respawnList = [], spriteLocationList = [],
        fpsCount = 0, gameLoopTs = 0,
        oldFireTs = 0, bulletVelocity = 20, bulletCount = 0;

var bulletLocationList = [];

var player = {
    health: 100,
    ammo: 0,
    weapon: null,
    X: 0,
    Y: 0,
    cellX: 0,
    cellY: 0,
    updateCXCY: function() {
        this.cellX = this.X >>> cell2n;
        this.cellY = this.Y >>> cell2n;
    }
};

var emptyCell = {
    cellType: 0,
    pickup: 0,
    enemy: 0,
    bullet: 0
};

var maps = [
    {
        mapData: [
            [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0]
        ],
        cellWidth: 256,
        cell2n: 8,
        name: "Level 1",
        horizonImage: "./img/background.jpg",
        maxLeft: -7200,
        floorImage: "./img/floor1.jpg",
        startX: 1920,
        startY: 1920,
        initialEnemies: [
            {cx: 7, mx: 64, cy: 10, my: 192, type: 0, id: 0, rot: 9, trkPos: 0, trkDat:[ 2, 64, -1, 8]}
            //{cx: 8, mx: 128, cy: 2, my: 128, type: 0, id: 0, rot: 1, trkPos: 0, trkDat:[/* 2, 64, -1, 8*/]}
        ],
        initialPickups: [
            {cx: 5, mx: 128, cy: 5, my: 128, pickupID: 1},
            {cx: 5, mx: 128, cy: 6, my: 128, pickupID: 2}
            //{cx: 6, mx: 128, cy: 6, my: 128, pickupID: 3}
        ]
    }
];

var pickups = [
    {
        wepID: 0,
        damage: 5,
        fireRate: 4,
        fireTimePeriod: 0.25,
        initialAmmo: 20,
        maxAmmo: 100,
        bgImage: "../img/wand.png",
        bulletBgImage: "../img/bulletTest.png",
        tp: true,
        type: 5,
        after: 0,
        onPickup: equip
    },
    {
        wepID: 1,
        damage: 10,
        fireRate: 2,
        fireTimePeriod: 0.5,
        initialAmmo: 15,
        maxAmmo: 50,
        bgImage: "../img/staff.png",
        bulletBgImage: "../img/bulletTest.png",
        tp: true,
        type: 5,
        after: 0,
        onPickup: equip
    },
    {
        ammoInc: 20,
        respawn: 5,
        baseRespawn: 5,
        bgImage: "../img/ammoPack.png",
        tp: true,
        type: 5,
        after: 0,
        onPickup: reload
    },
    {
        ammoInc: 40,
        respawn: 5,
        baseRespawn: 5,
        bgImage: "../img/bigAmmoPack.png",
        tp: true,
        type: 5,
        after: 0,
        onPickup: reload
    }
];

var enemies = [
    {
        id: 0,
        bgImage: "zombie1.png",
        tp: true,
        top: 0,
        type: 4,
        hp: 100,
        spd: 10,
        atkDist: 512,
        rndDist: 756,
        enemyWidth: 80,
        movTyp: 0 //0 is route, 1 is random, 2 is attack
    }

];

var cells = [
    {
        type: 0,
        tp: true,
        mapCol: "gray"
    },
    {
        type: 1,
        bgImage: "wall2window.jpg",
        tp: false,
        mapCol: "green"
    },
    {
        type: 1,
        bgImage: "wall2.jpg",
        tp: false,
        mapCol: "blue"
    },
    {
        type: 1,
        bgImage: "wall3.jpg",
        tp: false,
        mapCol: "light blue"
    },
    {
        type: 2,
        bgImage: "wall3Door.jpg",
        tp: false,
        mapCol: "yellow",
        after: 5
    },
    {
        type: 0,
        bgImage: "wall3doorOpen.png",
        tp: true,
        mapCol: "gray"
    }
];

function copy(o) {
    var v;
    var res = {};
    for (v in o) {
        res[v] = o[v];
    }
    return res;
}

function setup() {
    var i;
    //setting up view
    map = maps[0];
    fps = document.getElementById("fps");
    viewPort = document.getElementById("view");
    viewPort.style.perspective = perspectiveDepth + "px";
    background = document.createElement("IMG");
    background.className = "backgroundView";
    background.src = map.horizonImage;
    viewPort.appendChild(background);
    floor = document.createElement("DIV");
    floor.className = "floor";
    floor.style.background = "url(" + map.floorImage + ")";
    viewPort.appendChild(floor);
    wallDiv = document.createElement("DIV");
    wallDiv.className = "walls";
    viewPort.appendChild(wallDiv);
    //setting up globals
    cellSize = map.cellWidth;
    mapSizeX = map.mapData.length;
    mapSizeY = map.mapData[0].length;
    mapSizeXpx = mapSizeX*cellSize;
    mapSizeYpx = mapSizeY*cellSize;
    halfCW = cellSize / 2;
    cell2n = map.cell2n;
    player.X = map.startX;
    player.Y = map.startY;
    maxLeft = map.maxLeft;
    miniMapCellSize = (10/cellSize);
    //setting up enemies and sprites
    enemyList = map.initialEnemies;
    for (i = 0; i < enemyList.length; i++) {
        var thisEnemy = enemyList[i];
        cells[startEnemyId] = copy(enemies[thisEnemy.id]);
        cells[startEnemyId].mx = thisEnemy.mx;
        cells[startEnemyId].my = thisEnemy.my;
        cells[startEnemyId].cx = thisEnemy.cx;
        cells[startEnemyId].cy = thisEnemy.cy;
        cells[startEnemyId].rot = thisEnemy.rot;
        cells[startEnemyId].trkPos = thisEnemy.trkPos;
        cells[startEnemyId].trkDat = thisEnemy.trkDat;
        spriteLocationList[startEnemyId] = {};
        spriteLocationList[startEnemyId].px = (cells[startEnemyId].cx * cellSize) + cells[startEnemyId].mx;
        spriteLocationList[startEnemyId].py = (cells[startEnemyId].cy * cellSize) + cells[startEnemyId].my;
        spriteLocationList[startEnemyId].variance = cells[startEnemyId].enemyWidth;
        unravelEnemyPath(cells[startEnemyId]);
        map.mapData[thisEnemy.cx][thisEnemy.cy] = startEnemyId;
        startEnemyId++;
    }
    spriteList = map.initialPickups;
    for (i = 0; i < spriteList.length; i++) {
        var thisSprite = spriteList[i];
        cells[startPickupId] = copy(pickups[thisSprite.pickupID]);
        cells[startPickupId].mx = thisSprite.mx;
        cells[startPickupId].my = thisSprite.my;
        cells[startPickupId].cx = thisSprite.cx;
        cells[startPickupId].cy = thisSprite.cy;
        cells[startPickupId].mapId = startPickupId;
        map.mapData[thisSprite.cx][thisSprite.cy] = startPickupId;
        startPickupId++;
    }
    updateView();
    genMap();
    refactorMapArray();
    setUpKeys();
    setInterval(gameLoop, 10);
}

function refactorMapArray() {
    var mapCell;
    for (var i = 0; i < mapSizeX; i++) {
        for (var j = 0; j < mapSizeY; j++){
            mapCell = map.mapData[i][j];
            if (mapCell === 0) continue;
            map.mapData[i][j] = {};
            map.mapData[i][j].cellType = 0;
            map.mapData[i][j].pickup = 0;
            map.mapData[i][j].enemy = 0;
            map.mapData[i][j].bullet = 0;
            if (mapCell < 50) { map.mapData[i][j].cellType = mapCell; }
            else if (mapCell < 100) { map.mapData[i][j].pickup = mapCell; }
            else map.mapData[i][j].enemy = mapCell;
        }
    }
}

function checkIfCellEmpty(i, j) {
    if (JSON.stringify(map.mapData[i][j]) === JSON.stringify(emptyCell)) {
        map.mapData[i][j] = 0;
    }
}

function createEmptyCellObject(i , j) {
    map.mapData[i][j] = {};
    map.mapData[i][j].cellType = 0;
    map.mapData[i][j].pickup = 0;
    map.mapData[i][j].enemy = 0;
    map.mapData[i][j].bullet = 0;
}

function setUpKeys() {
    document.body.addEventListener("keydown", keyDownHandler, false);
    document.body.addEventListener("keyup", keyUpHandler, false);
    document.body.addEventListener("blur", keyClear, false);
    document.body.addEventListener("focusout", keyClear, false);
    document.body.addEventListener("mouseleave ", keyClear, false);
}

function keyClear() {
    turn = 0;
    move = 0;
    strafe = 0;
    fire = 0;
}

function keyDownHandler(e) {
    var kc = e.keyCode;
    if (kc === 65) {
        strafe = 1;
    }
    if (kc === 87) {
        move = 1;
    }
    if (kc === 68) {
        strafe = -1;
    }
    if (kc === 83) {
        move = -1;
    }
    if (kc === 32) {
        fire = 1;
    }
    if (kc === 13) {
        gameEnd = 1;
    }
    if (kc === 39) {
        turn = -1;
    }
    if (kc === 37) {
        turn = 1;
    }
    if (kc === 69) {
        openDoor();
    }
}

function keyUpHandler(e) {
    var kc = e.keyCode;
    if (kc === 65) {
        strafe = 0;
    }
    if (kc === 87) {
        move = 0;
    }
    if (kc === 68) {
        strafe = 0;
    }
    if (kc === 83) {
        move = 0;
    }
    if (kc === 32) {
        fire = 0;
    }
    if (kc === 39) {
        turn = 0;
    }
    if (kc === 37) {
        turn = 0;
    }
}

function openDoor() {
    player.updateCXCY();
    var ang = playerFacingAngle+45,
            dx = 0, dy = 0;
    ang = (ang>360) ? ang-360 : ang;
    if (ang >= 0 && ang < 90) dy = 1;
    else if (ang >= 90 && ang < 180) dx = 1;
    else if (ang >= 180 && ang < 270) dy = -1;
    else dx = -1;
    if (map.mapData[player.cellX + dx][player.cellY + dy] && cells[map.mapData[player.cellX + dx][player.cellY + dy].cellType].type == 2) {
        map.mapData[player.cellX + dx][player.cellY + dy].cellType = cells[map.mapData[player.cellX + dx][player.cellY + dy].cellType].after;
        document.getElementById((player.cellX+dx) + "," + (player.cellY+dy)).style.backgroundColor = cells[0].mapCol;

    }
}

function updateView() {
    var playerModX, playerModY;
    background.style.left = thisLeft + "px";
    background.style.top = backgroundTop + "px";
    playerModX = player.X - 2048;
    playerModY = player.Y - 2048;
    dx = Math.floor(perspectiveDepth * Math.sin(playerFacingAngle * pi180));
    dz = Math.floor(perspectiveDepth * Math.cos(playerFacingAngle * pi180));
    var tempX = (-dx - playerModX) % 512, tempZ = (dz + playerModY) % 512;
    floor.style.transform = 'rotateY(' + playerFacingAngle + 'deg) rotateX(90deg) translateZ(2450px) translateX(' + tempX + 'px)	translateY(' + tempZ + 'px) ';
    rayCast();
    render();
}

function equip() {
    var wep = cells[map.mapData[player.cellX][player.cellY].pickup];
    player.weapon = wep;
    player.ammo = wep.initialAmmo;
    cells.splice(wep.mapId, 1, null);
    map.mapData[player.cellX][player.cellY].pickup = wep.after;
    checkIfCellEmpty(player.cellX, player.cellY)
}

function reload() {
    if (player.weapon !== null) {
        var ammoPack = cells[map.mapData[player.cellX][player.cellY].pickup];
        if (player.ammo == player.weapon.maxAmmo) return;
        ammoPack.respawn = ammoPack.baseRespawn;
        player.ammo += ammoPack.ammoInc;
        player.ammo = (player.ammo > player.weapon.maxAmmo) ? player.weapon.maxAmmo : player.ammo;
        respawnList.push(ammoPack);
        map.mapData[player.cellX][player.cellY].pickup = ammoPack.after;
        checkIfCellEmpty(player.cellX, player.cellY)
    }
}

function respawnTimer() {
    var item;
    for (var i = 0; i < respawnList.length; i++) {
        item = respawnList[i];
        item.respawn--;
        if (item.respawn === 0) {
            if (map.mapData[item.cx][item.cy] === 0) createEmptyCellObject(item.cx, item.cy);
            if (map.mapData[item.cx][item.cy].pickup < 100) map.mapData[item.cx][item.cy].pickup = item.mapId;
            else map.mapData[item.cx][item.cy].enemy = item.mapId;
            respawnList.splice(i, 1);
        }
    }
}

function doMove() {
    var movDir, strafeDir, newMapX, newMapY, moveInc = 10,
            CMC, CMCCell, mapX, mapY,
            playerDX, playerDY;
    if (turn != 0) {
        thisLeft += turn * step;
        playerFacingAngle += turn * angleStep;
        playerFacingAngle = (playerFacingAngle + q4) % q4; //make sure it is in range 0-360
        if (thisLeft < maxLeft) {
            thisLeft -= maxLeft;
        } else if (thisLeft > 0) {
            thisLeft = maxLeft + thisLeft;
        }
        updateMap();
    }
    if (move != 0) {
        //compute dx and dy
        if (move > 0) {
            movDir = moveInc
        }
        else {
            movDir = -moveInc;
        }

        playerDX = Math.sin(playerFacingAngle * pi180) * movDir;
        playerDY = Math.cos(playerFacingAngle * pi180) * movDir;
        mapX = player.X;
        mapY = player.Y;
        if (playerDX != 0) {
            if (playerDX < 0) {
                newMapX = mapX + playerDX - minimumDistanceFromCellBoundary
            } else {
                newMapX = mapX + playerDX + minimumDistanceFromCellBoundary;
            }
            player.cellX = newMapX >>> cell2n;
            player.cellY = mapY >>> cell2n;
            CMC = (map.mapData[player.cellX][player.cellY]) ? map.mapData[player.cellX][player.cellY].cellType : 0;
            CMCCell = cells[CMC];
            if (CMC && !CMCCell.tp) {
                if (playerDX < 0) {
                    player.X = Math.floor(((player.cellX + 1) << cell2n) + minimumDistanceFromCellBoundary)
                } else {
                    player.X = Math.floor((player.cellX << cell2n) - minimumDistanceFromCellBoundary);
                }
            }
            else {
                player.X = mapX + playerDX;
            }
        }

        if (playerDY != 0) {
            if (playerDY < 0) {
                newMapY = mapY + playerDY - minimumDistanceFromCellBoundary
            } else {
                newMapY = mapY + playerDY + minimumDistanceFromCellBoundary;
            }
            player.cellX = mapX >>> cell2n;
            player.cellY = newMapY >>> cell2n;
            CMC = (map.mapData[player.cellX][player.cellY]) ? map.mapData[player.cellX][player.cellY].cellType : 0;
            CMCCell = cells[CMC];
            if (CMC && !CMCCell.tp) {
                if (playerDY < 0) {
                    player.Y = Math.floor(((player.cellY + 1) << cell2n) + minimumDistanceFromCellBoundary)
                } else {
                    player.Y = Math.floor((player.cellY << cell2n) - minimumDistanceFromCellBoundary);
                }
            }
            else {
                player.Y = mapY + playerDY;
            }
        }
        updateMap();
        if (map.mapData[player.cellX][player.cellY] && cells[map.mapData[player.cellX][player.cellY].pickup].onPickup) {
            cells[map.mapData[player.cellX][player.cellY].pickup].onPickup();
        }
    }
    if (strafe != 0) {
        if (strafe > 0) {
            strafeDir = -moveInc
        }
        else {
            strafeDir = moveInc;
        }
        playerDX = Math.cos(playerFacingAngle * pi180) * strafeDir;
        playerDY = -Math.sin(playerFacingAngle * pi180) * strafeDir;
        mapX = player.X;
        mapY = player.Y;
        if (playerDX != 0) {
            if (playerDX < 0) {
                newMapX = mapX + playerDX - minimumDistanceFromCellBoundary
            } else {
                newMapX = mapX + playerDX + minimumDistanceFromCellBoundary;
            }
            player.cellX = newMapX >>> cell2n;
            player.cellY = mapY >>> cell2n;
            CMC = (map.mapData[player.cellX][player.cellY]) ? map.mapData[player.cellX][player.cellY].cellType : 0;
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.type == 1)) {
                if (playerDX < 0) {
                    player.X = Math.floor(((player.cellX + 1) << cell2n) + minimumDistanceFromCellBoundary)
                } else {
                    player.X = Math.floor((player.cellX << cell2n) - minimumDistanceFromCellBoundary);
                }
            }
            else {
                player.X = mapX + playerDX;
            }
        }

        if (playerDY != 0) {
            if (playerDY < 0) {
                newMapY = mapY + playerDY - minimumDistanceFromCellBoundary
            } else {
                newMapY = mapY + playerDY + minimumDistanceFromCellBoundary;
            }
            player.cellX = mapX >>> cell2n;
            player.cellY = newMapY >>> cell2n;
            CMC = (map.mapData[player.cellX][player.cellY]) ? map.mapData[player.cellX][player.cellY].cellType : 0;
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.type == 1)) {
                if (playerDY < 0) {
                    player.Y = Math.floor(((player.cellY + 1) << cell2n) + minimumDistanceFromCellBoundary)
                } else {
                    player.Y = Math.floor((player.cellY << cell2n) - minimumDistanceFromCellBoundary);
                }
            }
            else {
                player.Y = mapY + playerDY;
            }
        }
        updateMap();
    }
    if (fire != 0) {
        if (player.weapon) {
            var ts = Math.round((new Date()).getTime());
            if (ts > (oldFireTs + (player.weapon.fireTimePeriod * 1000))) {
                fireBullet();
                oldFireTs = ts;
            }
        }
    }
    document.getElementById("mapX").innerHTML = "Map x: " + player.cellX;
    document.getElementById("mapY").innerHTML = "Map y: " + player.cellY;
    document.getElementById("ang").innerHTML = "Ang: " + playerFacingAngle;
}

function gameLoop() {
    var tNow = new Date().getSeconds();
    if (gameLoopTs != tNow) {
        fps.innerHTML = fpsCount + "fps";
        fpsCount = 0;
        respawnTimer();
    }
    else {
        fpsCount++;
    }
    gameLoopTs = tNow;
    doMove();
    if (bulletCount > 0) {
        updateBullets();
    }
    //check for enemy death
    if (spriteLoopCount == spriteLoop) {
        moveEnemies();
        spriteLoopCount = 0;
    }
    spriteLoopCount++;
    //check for game end (end of level / player death)
    updateView();
    //update status bar
}

function genMap() {
    player.updateCXCY();
    var i, j, div, translateX, translateY;
    translateX = 87.5 - (player.cellX*10);
    translateY = 87.5 - (player.cellY*10);
    for (i = 0; i < mapSizeX; i++) {
        for (j = 0; j < mapSizeY; j++) {
            div = document.createElement("div");
            if (map.mapData[i][j] < 50) {
                div.style.backgroundColor = cells[map.mapData[i][j]].mapCol;
            } else {
                div.style.backgroundColor = cells[0].mapCol;
            }
            div.style.top = Math.ceil(i*10 + (translateX))-5+"px";
            div.style.left = Math.ceil(j*10 + (translateY))-5+"px";
            div.className = "mapCell";
            div.id = i + "," + j;
            document.getElementById("map").appendChild(div);
        }
    }
    document.getElementById("map").style.transform = "rotate(" + (-playerFacingAngle-90) + "deg)";
    player.updateCXCY();
    document.getElementById(player.cellX + "," + player.cellY).style.backgroundColor = "white";
}

function updateMap() {
    var list = document.getElementsByClassName("mapCell");
    player.updateCXCY();
    document.getElementById(player.cellX + "," + player.cellY).style.backgroundColor = "white";
    if ((oldPxForMiniMap != player.cellX || oldPyForMiniMap != player.cellY) && oldPyForMiniMap !== undefined) {
        if (map.mapData[oldPxForMiniMap][oldPyForMiniMap].cellType) {
            document.getElementById(oldPxForMiniMap + "," + oldPyForMiniMap).style.backgroundColor = cells[map.mapData[oldPxForMiniMap][oldPyForMiniMap].cellType].mapCol;
        } else {
            document.getElementById(oldPxForMiniMap + "," + oldPyForMiniMap).style.backgroundColor = cells[0].mapCol;
        }
    }
    document.getElementById("map").style.transform = "rotate(" + (-playerFacingAngle-90) + "deg)";
    for (var i = 0; i < list.length; i++) {
        list[i].style.transform = "translate(" + Math.ceil((player.Y-map.startY)*miniMapCellSize*-1)+ "px," + Math.ceil((player.X-map.startX)*miniMapCellSize*-1) +"px)";
    }
    oldPxForMiniMap = player.cellX;
    oldPyForMiniMap = player.cellY;
}

function fireBullet() {
    var bullet = {}, bulletListEntry = {};
    bullet.cy = player.cellY;
    bullet.cx = player.cellX;
    bullet.mx = player.X - (player.cellX * cellSize);
    bullet.my = player.Y - (player.cellY * cellSize);
    bullet.dy = Math.cos(playerFacingAngle * pi180) * bulletVelocity;
    bullet.dx = Math.sin(playerFacingAngle * pi180) * bulletVelocity;
    bullet.type = 5;
    bullet.damage = player.weapon.damage;
    bullet.bgImage = player.weapon.bulletBgImage;
    if (map.mapData[player.cellX][player.cellY] === 0) {
        createEmptyCellObject(player.cellX, player.cellY);
        map.mapData[player.cellX][player.cellY].bullet = []
    } else if (map.mapData[player.cellX][player.cellY].bullet === 0) {
        map.mapData[player.cellX][player.cellY].bullet = []
    }
    bulletListEntry.x = player.cellX;
    bulletListEntry.y = player.cellY;
    if (!bulletLocationList[player.cellX]) {
        bulletLocationList[player.cellX] = []
    }
    bulletLocationList[player.cellX][player.cellY] = bulletListEntry;
    bulletCount++;
    map.mapData[player.cellX][player.cellY].bullet.push(bullet);
}

function updateBullets() {
    var bulletArray, bulletArrayLength, xChanged = 0, yChanged = 0, bulletsRemoved = 0, bulletHit, damage;
    for (var i = 0; i < bulletLocationList.length; i++) {
        if (!bulletLocationList[i]) continue;
        for (var j = 0; j < bulletLocationList[i].length; j++) {
            if (!bulletLocationList[i][j]) continue;
            bulletArray = map.mapData[bulletLocationList[i][j].x][bulletLocationList[i][j].y].bullet;
            bulletArrayLength = bulletArray.length;
            bulletsRemoved = 0;
            for (var k = 0; k < bulletArrayLength; k++) {
                bulletHit = false;
                xChanged = 0;
                yChanged = 0;
                bulletArray[k - bulletsRemoved].mx += bulletArray[k - bulletsRemoved].dx;
                bulletArray[k - bulletsRemoved].my += bulletArray[k - bulletsRemoved].dy;
                if (bulletArray[k - bulletsRemoved].mx > cellSize) {
                    bulletArray[k - bulletsRemoved].cx += 1;
                    bulletArray[k - bulletsRemoved].mx -= cellSize;
                    xChanged = 1;
                }
                if (bulletArray[k - bulletsRemoved].my > cellSize) {
                    bulletArray[k - bulletsRemoved].cy += 1;
                    bulletArray[k - bulletsRemoved].my -= cellSize;
                    yChanged = 1;
                }
                if (bulletArray[k - bulletsRemoved].mx < 0) {
                    bulletArray[k - bulletsRemoved].cx -= 1;
                    bulletArray[k - bulletsRemoved].mx += cellSize;
                    xChanged = -1;
                }
                if (bulletArray[k - bulletsRemoved].my < 0) {
                    bulletArray[k - bulletsRemoved].cy -= 1;
                    bulletArray[k - bulletsRemoved].my += cellSize;
                    yChanged = -1;
                }
                if (bulletHit = checkIfBulletHit(bulletArray[k - bulletsRemoved])) {
                    damage = bulletArray[k - bulletsRemoved].damage;
                    bulletArray.splice(k - bulletsRemoved, 1);
                    if (bulletArray.length == 0) bulletLocationList[i][j] = null;
                    checkBulletListEmpty(i, j);
                    checkIfCellEmpty(i, j);
                    bulletsRemoved++;
                    bulletCount--;
                    enemyHit(bulletHit, damage);
                    continue;
                }
                if (xChanged || yChanged) {
                    if (map.mapData[i + xChanged][j + yChanged].cellType) {
                        if (!cells[map.mapData[i + xChanged][j + yChanged].cellType].tp) {
                            bulletArray.splice(k - bulletsRemoved, 1);
                            if (bulletArray.length == 0) bulletLocationList[i][j] = null;
                            checkBulletListEmpty(i, j);
                            checkIfCellEmpty(i, j);
                            bulletsRemoved++;
                            bulletCount--;
                            continue;
                        }
                    }
                    if (map.mapData[i + xChanged][j + yChanged] === 0) createEmptyCellObject(i + xChanged, j + yChanged);
                    if (map.mapData[i + xChanged][j + yChanged].bullet === 0) map.mapData[i + xChanged][j + yChanged].bullet = [];
                    map.mapData[i + xChanged][j + yChanged].bullet.push(bulletArray[k]);
                    bulletArray.splice(k - bulletsRemoved, 1);
                    if (!bulletLocationList[i + xChanged]) bulletLocationList[i + xChanged] = [];
                    bulletLocationList[i + xChanged][j + yChanged] = {};
                    bulletLocationList[i + xChanged][j + yChanged].x = bulletLocationList[i][j].x + xChanged;
                    bulletLocationList[i + xChanged][j + yChanged].y = bulletLocationList[i][j].y + yChanged;
                    if (bulletArray.length == 0) bulletLocationList[i][j] = null;
                    checkBulletListEmpty(i, j);
                    checkIfCellEmpty(i, j);
                    bulletsRemoved++;
                }
            }
        }
    }
}

function checkBulletListEmpty(i, j) {
    var bulletArray = map.mapData[i][j].bullet;
    if (map.mapData[i][j] === 0 || bulletArray === 0) return;
    if (bulletArray.length === 0) map.mapData[i][j].bullet = 0;
}

function checkIfBulletHit(bullet) {
    var bulletPx, bulletPy;
    for (var i = 100; i < spriteLocationList.length; i++) {
        if (spriteLocationList[i] === null) continue;
        bulletPx = (bullet.cx * cellSize) + bullet.mx;
        bulletPy = (bullet.cy * cellSize) + bullet.my;
        if ((bulletPx > (spriteLocationList[i].px - spriteLocationList[i].variance)) && (bulletPx < (spriteLocationList[i].px + spriteLocationList[i].variance)) &&
                (bulletPy > (spriteLocationList[i].py - spriteLocationList[i].variance)) && (bulletPy < (spriteLocationList[i].py + spriteLocationList[i].variance))) {
            return i;
        }
    }
    return false;
}

function enemyHit(enemyId, damage) {
    cells[enemyId].hp -= damage;
    if (cells[enemyId].hp <= 0) {
        map.mapData[cells[enemyId].cx][cells[enemyId].cy].enemy = 0;
        checkIfCellEmpty(cells[enemyId].cx, cells[enemyId].cy);
        cells[enemyId] = null;
        spriteLocationList[enemyId] = null;
    }
}

function unravelEnemyPath(e) {
    var path = [], pathPos, newPathPos = 0, moveType;
    for (pathPos = 0; pathPos < e.trkDat.length; pathPos += 2) {
        moveType = e.trkDat[pathPos];
        for (var i = 0; i < e.trkDat[pathPos+1]; i++) {
            path[newPathPos] = moveType;
            newPathPos++;
        }
    }
    e.trkDat = path;
}

function moveEnemies() {
    var i, e,
            ex, ey, ed,
            spriteAng, mov;
    for (i = 100; i < cells.length; i++) {
        if (cells[i] === null) continue;
        e = cells[i];
        mov = e.trkDat[e.trkPos];
        ex = e.cx * cellSize + e.mx;
        ey = e.cy * cellSize + e.my;
        ed = Math.sqrt((player.X - ex) * (player.X - ex) + (player.Y - ey) * (player.Y - ey));
        if (e.movTyp == 0) {            //path follow
            if (ed < e.atkDist) {
                e.movTyp = 2;
                continue;
            }
            e.attack = false;
            if (mov == 2) {
                eForwards(e, i);
            } else if (mov == 1 || mov == -1) {
                eRotate(e, i, mov);
            }
            e.trkPos++;
            if (e.trkPos > e.trkDat.length) {
                e.trkPos = 0;
            }
        } else if (e.movTyp == 1) {     //random
            if (ed < e.atkDist) {
                e.movTyp = 2;
                continue;
            }
            e.attack = false;
            if (randMovCount == 0) {
                randMovCount = Math.floor(Math.random() * 20) + 30;
            }
            if (randMovI < randMovCount) {
                eForwards(e, i);
                randMovI++;
                if (randMovI == randMovCount) {
                    randMovCount = 0;
                    randMovI = 0;
                    e.rot = Math.floor(Math.random() * 16) + 1;
                }
            }
        } else if (e.movTyp == 2) {     //attack
            if (ed > e.rndDist) {
                e.movTyp = 1;
                continue;
            }
            e.attack = true;
            spriteAng = InvTan(ex - player.X, player.Y - ey) + 11.75;
            spriteAng = Math.floor(spriteAng / 22.5);
            if (spriteAng > e.rot) {
                e.rot++
            } else if (spriteAng < e.rot) {
                e.rot--
            }
            eForwards(e, i);
        }
    }
}

function eRotate(e, id, dir) {
    e.rot += dir;
    if (e.rot > 16) {
        e.rot -= 16;
    }
    if (e.rot < 1) {
        e.rot += 16;
    }
}

function eForwards(e, id) {
    var dx, dy;
    map.mapData[e.cx][e.cy].enemy = 0;
    dy = Math.cos((e.rot - 1) * pi8) * e.spd;
    dx = -Math.sin((e.rot - 1) * pi8) * e.spd;
    if (dy > 0) {
        if ((e.my + dy) > halfCW) {
            if (!map.mapData[e.cx][e.cy + 1] || cells[map.mapData[e.cx][e.cy + 1].cellType].tp) {
                if ((e.my + dy) > cellSize) {
                    checkIfCellEmpty(e.cx, e.cy);
                    e.my += dy;
                    e.my -= cellSize;
                    e.cy += 1;
                } else {
                    e.my += dy;
                }
            }
        } else {
            e.my += dy;
        }
    } else {
        if ((e.my + dy) < halfCW) {
            if (!map.mapData[e.cx][e.cy - 1] || cells[map.mapData[e.cx][e.cy - 1].cellType].tp) {
                if ((e.my + dy) < 0) {
                    checkIfCellEmpty(e.cx, e.cy);
                    e.my += dy;
                    e.my += cellSize;
                    e.cy -= 1;
                } else {
                    e.my += dy;
                }
            }
        } else {
            e.my += dy;
        }
    }
    if (dx > 0) {
        if ((e.mx + dx) > halfCW) {
            if (!map.mapData[e.cx + 1][e.cy] || cells[map.mapData[e.cx + 1][e.cy].cellType].tp) {
                if ((e.mx + dx) > cellSize) {
                    checkIfCellEmpty(e.cx, e.cy);
                    e.mx += dx;
                    e.mx -= cellSize;
                    e.cx += 1;
                } else {
                    e.mx += dx;
                }
            }
        } else {
            e.mx += dx;
        }
    } else {
        if ((e.mx + dx) < halfCW) {
            if (!map.mapData[e.cx - 1][e.cy] || cells[map.mapData[e.cx - 1][e.cy].cellType].tp) {
                if ((e.mx + dx) < 0) {
                    checkIfCellEmpty(e.cx, e.cy);
                    e.mx += dx;
                    e.mx += cellSize;
                    e.cx -= 1;
                } else {
                    e.mx += dx;
                }
            }
        } else {
            e.mx += dx;
        }
    }
    if (map.mapData[e.cx][e.cy] === 0) {
        createEmptyCellObject(e.cx, e.cy);
    }
    spriteLocationList[id].px += dx;
    spriteLocationList[id].py += dy;
    map.mapData[e.cx][e.cy].enemy = id;
}

function render() {
    var i, wli, tX, tZ, ang, topOffset = 101;
    wallDiv.innerHTML = ""; //remove old wall segments
    for (i = 0; i < wallList.length; i++) {
        wli = wallList[i];
        if (wli.type > 2) {
            wli.div = document.createElement("DIV");
            wli.div.className = "clipImg";
            wli.div.style.left = halfVW - wli.W + "px";
            wli.img = document.createElement("IMG");
            wli.img.className = "wallTile";
            wli.img.style.top = wli.top + "px";
            wli.img.src = "./img/" + wli.bgImage;
            wli.img.className = wli.CN;
            wli.div.appendChild(wli.img);
            //compute dX from angle and spriteDepth0
            tX = wli.X;
            tZ = -wli.Z;
            wli.div.style.transform = 'rotatey(' + wli.R + 'deg) rotatex(0deg) translateX(' + tX + 'px) translateY(' + topOffset + 'px) translateZ(' + tZ + 'px)';
            wallDiv.appendChild(wli.div);
        }
        else {
            wli.img = document.createElement("IMG");
            wli.img.className = "wallTile";
            wli.img.src = "./img/" + wli.bgImage;

            wli.img.style.left = halfVW - wli.W + "px";
            if (wli.R) {
                ang = playerFacingAngle + q1;
                tX = wli.X - dx;
                tZ = wli.Z - dz;
                wli.img.style.transform = 'rotatey(' + ang + 'deg) rotatex(0deg) translateX(' + tZ + 'px) translateY(' + topOffset + 'px) translateZ(' + tX + 'px)';
            }
            else {
                tX = wli.X - dx;
                tZ = -wli.Z + dz;
                wli.img.style.transform = 'rotatey(' + playerFacingAngle + 'deg) rotatex(0deg) translateX(' + tX + 'px) translateY(' + topOffset + 'px) translateZ(' + tZ + 'px)'
            }
            wallDiv.appendChild(wli.img);
        }
    }
}

function InvTan(dx, dy) {
    var theta;
    if (dy == 0) {
        theta = (dx < 0) ? q3 : q1
    } else {
        if (dx > 0) {
            if (dy > 0) {
                theta = Math.atan(dx / dy) / pi180
            } else {
                theta = q2 + Math.atan(dx / dy) / pi180;
            }
        }
        else {
            if (dy > 0) {
                theta = q4 + Math.atan(dx / dy) / pi180
            } else {
                theta = q2 + Math.atan(dx / dy) / pi180;
            }
        }
    }
    return theta;
}

function rayCast() {
    var dX, dY, rayPixelPosX, rayPixelPosY, oldRayCellPosX, oldRayCellPosY, rayCellPosX, rayCellPosY,
            CMC, CMCCell,
            clockwise, oldClock = true,
            deltaX, deltaY, dist, theta, dat,
            cornerRayX, cornerRayY, cornerRayAngle,
            nextCornerRayX, nextCornerRayY, nextCornerRayAngle,
            spriteAng, spriteRot, currList = [],
            rayStep = viewAngle / halfVW,
            startRay = playerFacingAngle - viewAngle, endRay = playerFacingAngle + viewAngle,
            countRay = startRay % q4, currentRay = countRay,
            cornerDX, cornerDY, rotClock, rotAnti, clockWallDeltaX, clockWallDeltaY,
            antiWallDeltaX, antiWallDeltaY, nextCornerX, nextCornerY, prevCornerX,
            prevCornerY, prevCornerRayX, prevCornerRayY, prevCornerRayAngle,
            doBreak = false,
            bullets, bullet;

    wallList = [];
    if (currentRay < 0) {
        countRay += q4;
        currentRay += q4;
        endRay += q4;
    }
    oldRayCellPosX = -1;
    oldRayCellPosY = -1;

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
            nextCornerX = cellSize;
            nextCornerY = 0;
            prevCornerX = 0;
            prevCornerY = cellSize;
        }
        else if (currentRay < q2) {
            cornerDX = 0;
            cornerDY = cellSize;
            rotClock = true;
            rotAnti = false;
            clockWallDeltaX = 0;
            clockWallDeltaY = halfCW;
            antiWallDeltaX = halfCW;
            antiWallDeltaY = cellSize;
            nextCornerX = 0;
            nextCornerY = 0;
            prevCornerX = cellSize;
            prevCornerY = cellSize;
        }
        else if (currentRay < q3) {
            cornerDX = cellSize;
            cornerDY = cellSize;
            rotClock = false;
            rotAnti = true;
            clockWallDeltaX = halfCW;
            clockWallDeltaY = cellSize;
            antiWallDeltaX = cellSize;
            antiWallDeltaY = halfCW;
            nextCornerX = 0;
            nextCornerY = cellSize;
            prevCornerX = cellSize;
            prevCornerY = 0;
        }
        else {
            cornerDX = cellSize;
            cornerDY = 0;
            rotClock = true;
            rotAnti = false;
            clockWallDeltaX = cellSize;
            clockWallDeltaY = halfCW;
            antiWallDeltaX = halfCW;
            antiWallDeltaY = 0;
            nextCornerX = cellSize;
            nextCornerY = cellSize;
            prevCornerX = 0;
            prevCornerY = 0;
        }
        dX = Math.sin(currentRay * pi180);
        dY = Math.cos(currentRay * pi180);
        rayPixelPosX = player.X;
        rayPixelPosY = player.Y;
        do {
            rayPixelPosX += dX;
            rayPixelPosY += dY;
            rayCellPosX = rayPixelPosX >>> cell2n;
            rayCellPosY = rayPixelPosY >>> cell2n;
            if ((rayPixelPosX < 0) || (rayPixelPosY < 0) || (rayPixelPosX > mapSizeXpx) || (rayPixelPosY > mapSizeYpx)) {
                break;
            }
            CMC = map.mapData[rayCellPosX][rayCellPosY];
            for (var type in CMC) {
                CMCCell = cells[CMC[type]];
                if (CMC[type]) {
                    if ((CMCCell && CMCCell.type < 3) || CMC[type].type < 3) { //wall or door
                        cornerRayX = rayCellPosX * cellSize + cornerDX - player.X;
                        cornerRayY = rayCellPosY * cellSize + cornerDY - player.Y;
                        cornerRayAngle = InvTan(cornerRayX, cornerRayY);
                        if ((currentRay > q3) && (cornerRayAngle < q1)) {
                            cornerRayAngle += q4;
                        }//if they are reversed
                        else if ((cornerRayAngle > q3) && (currentRay < q1)) {
                            cornerRayAngle -= q4;
                        } //if they are reversed
                        clockwise = (cornerRayAngle < currentRay);

                        if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock) && CMCCell && !CMCCell.tp) {
                            doBreak = true;
                        }
                        if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock)) {
                            break;
                        }
                        oldRayCellPosX = rayCellPosX;
                        oldRayCellPosY = rayCellPosY;
                        oldClock = clockwise;

                        if (clockwise) {
                            //clock
                            deltaX = player.X - rayCellPosX * cellSize - clockWallDeltaX;
                            deltaY = player.Y - rayCellPosY * cellSize - clockWallDeltaY;
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
                                dat.bgImage = CMCCell.bgImage;
                                dat.type = CMCCell.type;
                                wallList.push(dat);
                            }
                        }
                        else {
                            deltaX = player.X - rayCellPosX * cellSize - antiWallDeltaX;
                            deltaY = player.Y - rayCellPosY * cellSize - antiWallDeltaY;
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
                                dat.bgImage = CMCCell.bgImage;
                                dat.type = CMCCell.type;
                                wallList.push(dat);
                            }
                        }
                    }
                    else if (!CMCCell) { // bullet
                        bullets = CMC[type];
                        for (var x = 0; x < bullets.length; x++) {
                            bullet = bullets[x];
                            deltaX = (rayCellPosX * cellSize + bullet.mx) - player.X;
                            deltaY = (rayCellPosY * cellSize + bullet.my) - player.Y;
                            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                            if (!currList[deltaX]) {
                                currList[deltaX] = [];
                            }
                            if (!currList[deltaX][deltaY]) {
                                currList[deltaX][deltaY] = true;
                                //compute angle from sprite dx, dy
                                spriteAng = InvTan(deltaX, deltaY);
                                theta = playerFacingAngle - spriteAng;
                                if (theta < 0) {
                                    theta += 360;
                                }
                                if (theta >= 360) {
                                    theta -= 360;
                                }
                                if ((theta < 50) || (theta > 310)) {
                                    //compute dX, dZ from angle of bullet - veiw port center angle
                                    var bulletAdj = Math.sin(theta * pi180) * 750;
                                    var bulletHyp = Math.sqrt(bulletAdj * bulletAdj + 250 * 250);
                                    dat = {};
                                    dat.R = theta;
                                    dat.X = -bulletAdj;
                                    dat.Z = -1100 + dist + bulletHyp;
                                    dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                                    dat.W = halfCW;
                                    dat.bgImage = bullet.bgImage;
                                    dat.type = bullet.type;
                                    dat.top = bullet.top;
                                    wallList.push(dat);
                                }
                            }
                        }
                    }
                    else { //sprite
                        //compute actual dx, dy
                        deltaX = (rayCellPosX * cellSize + CMCCell.mx) - player.X;
                        deltaY = (rayCellPosY * cellSize + CMCCell.my) - player.Y;
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        //check if already added to wall list
                        if (!currList[deltaX]) {
                            currList[deltaX] = [];
                        }
                        if (!currList[deltaX][deltaY]) {
                            currList[deltaX][deltaY] = true;
                            //compute angle from sprite dx, dy
                            spriteAng = InvTan(deltaX, deltaY);
                            theta = playerFacingAngle - spriteAng;
                            if (theta < 0) {
                                theta += 360;
                            }
                            if (theta >= 360) {
                                theta -= 360;
                            }
                            if ((theta < 50) || (theta > 310)) {
                                //compute dX, dZ from angle of sprite - veiw port center angle
                                var spriteAdj = Math.sin(theta * pi180) * 750;
                                var spriteHyp = Math.sqrt(spriteAdj * spriteAdj + 250 * 250);

                                if (CMCCell.rot != undefined) {
                                    spriteRot = CMCCell.rot + (spriteAng + 11.75) / 22.5 - 8;
                                    if (spriteRot < 1) {
                                        spriteRot += 16;
                                    }
                                    if (spriteRot > 16) {
                                        spriteRot -= 16;
                                    }
                                    spriteRot = Math.floor(spriteRot);
                                }
                                else {
                                    spriteRot = false;
                                }

                                //add to wall list
                                dat = {};
                                dat.R = theta;
                                dat.X = -spriteAdj;
                                dat.Z = -1100 + dist + spriteHyp;
                                dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                                dat.W = halfCW;
                                dat.bgImage = CMCCell.bgImage;
                                dat.type = CMCCell.type;
                                dat.top = CMCCell.top;
                                if (spriteRot) {
                                    dat.CN = "rot" + spriteRot;
                                }
                                wallList.push(dat);
                            }
                        }
                    }
                }
                if (CMCCell && !CMCCell.tp) {
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
                        nextCornerRayX = rayCellPosX * cellSize + nextCornerX - player.X;
                        nextCornerRayY = rayCellPosY * cellSize + nextCornerY - player.Y;
                        nextCornerRayAngle = InvTan(nextCornerRayX, nextCornerRayY);
                        if ((countRay > nextCornerRayAngle)) {
                            nextCornerRayAngle += q4;
                        } //if they are reversed
                        countRay = nextCornerRayAngle;
                    }
                    doBreak = true;
                }
            }
            if (doBreak) {
                doBreak = false;
                break;
            }
        } while (true);
        countRay += rayStep;
        currentRay = countRay % q4;
    }
    while (countRay < endRay);

    doBreak = false;
    startRay = playerFacingAngle - viewAngle;
    endRay = playerFacingAngle + viewAngle;
    countRay = endRay;
    currentRay = countRay;
    if (currentRay >= q4) {
        countRay -= q4;
        currentRay -= q4;
        startRay -= q4;
    }
    oldRayCellPosX = -1;
    oldRayCellPosY = -1;

    do {
        if (currentRay < 0) {
            cornerDX = cellSize;
            cornerDY = 0;
            rotClock = true;
            rotAnti = false;
            clockWallDeltaX = cellSize;
            clockWallDeltaY = halfCW;
            antiWallDeltaX = halfCW;
            antiWallDeltaY = 0;
            nextCornerX = cellSize;
            nextCornerY = cellSize;
            prevCornerX = 0;
            prevCornerY = 0;
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
            nextCornerX = cellSize;
            nextCornerY = 0;
            prevCornerX = 0;
            prevCornerY = cellSize;
        }
        else if (currentRay < q2) {
            cornerDX = 0;
            cornerDY = cellSize;
            rotClock = true;
            rotAnti = false;
            clockWallDeltaX = 0;
            clockWallDeltaY = halfCW;
            antiWallDeltaX = halfCW;
            antiWallDeltaY = cellSize;
            nextCornerX = 0;
            nextCornerY = 0;
            prevCornerX = cellSize;
            prevCornerY = cellSize;
        }
        else if (currentRay < q3) {
            cornerDX = cellSize;
            cornerDY = cellSize;
            rotClock = false;
            rotAnti = true;
            clockWallDeltaX = halfCW;
            clockWallDeltaY = cellSize;
            antiWallDeltaX = cellSize;
            antiWallDeltaY = halfCW;
            nextCornerX = 0;
            nextCornerY = cellSize;
            prevCornerX = cellSize;
            prevCornerY = 0;
        }
        else {
            cornerDX = cellSize;
            cornerDY = 0;
            rotClock = true;
            rotAnti = false;
            clockWallDeltaX = cellSize;
            clockWallDeltaY = halfCW;
            antiWallDeltaX = halfCW;
            antiWallDeltaY = 0;
            nextCornerX = cellSize;
            nextCornerY = cellSize;
            prevCornerX = 0;
            prevCornerY = 0;
        }
        dX = Math.sin(currentRay * pi180);
        dY = Math.cos(currentRay * pi180);
        rayPixelPosX = player.X;
        rayPixelPosY = player.Y;
        do {
            rayPixelPosX += dX;
            rayPixelPosY += dY;
            rayCellPosX = rayPixelPosX >>> cell2n;
            rayCellPosY = rayPixelPosY >>> cell2n;
            if ((rayPixelPosX < 0) || (rayPixelPosY < 0) || (rayPixelPosX > mapSizeXpx) || (rayPixelPosY > mapSizeYpx)) {
                break;
            }
            CMC = map.mapData[rayCellPosX][rayCellPosY];
            for (type in CMC) {
                CMCCell = cells[CMC[type]];
                if (CMC[type]) {
                    if ((CMCCell && CMCCell.type < 3) || CMC[type].type < 3) { //wall or door
                        cornerRayX = rayCellPosX * cellSize + cornerDX - player.X;
                        cornerRayY = rayCellPosY * cellSize + cornerDY - player.Y;
                        cornerRayAngle = InvTan(cornerRayX, cornerRayY);
                        if ((currentRay > q3) && (cornerRayAngle < q1)) {
                            cornerRayAngle += q4;
                        }//if they are reversed
                        else if ((cornerRayAngle > q3) && (currentRay < q1)) {
                            cornerRayAngle -= q4;
                        } //if they are reversed
                        clockwise = (cornerRayAngle < currentRay);

                        if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock) && CMCCell && !CMCCell.tp) {
                            doBreak = true;
                        }
                        if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock)) {
                            break;
                        }

                        oldRayCellPosX = rayCellPosX;
                        oldRayCellPosY = rayCellPosY;
                        oldClock = clockwise;

                        if (clockwise) {
                            //clock
                            deltaX = player.X - rayCellPosX * cellSize - clockWallDeltaX;
                            deltaY = player.Y - rayCellPosY * cellSize - clockWallDeltaY;
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
                                dat.bgImage = CMCCell.bgImage;
                                dat.type = CMCCell.type;
                                if (CMCCell.rot) {
                                    dat.CN = "rot" + CMCCell.rot;
                                }
                                wallList.push(dat);
                            }
                        }
                        else {
                            deltaX = player.X - rayCellPosX * cellSize - antiWallDeltaX;
                            deltaY = player.Y - rayCellPosY * cellSize - antiWallDeltaY;
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
                                dat.bgImage = CMCCell.bgImage;
                                dat.type = CMCCell.type;
                                if (CMCCell.rot) {
                                    dat.CN = "rot" + CMCCell.rot;
                                }
                                wallList.push(dat);
                            }
                        }
                    }
                }
                if (CMCCell && !CMCCell.tp) {
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
                        prevCornerRayX = rayCellPosX * cellSize + prevCornerX - player.X;
                        prevCornerRayY = rayCellPosY * cellSize + prevCornerY - player.Y;
                        prevCornerRayAngle = InvTan(prevCornerRayX, prevCornerRayY);
                        if ((countRay < prevCornerRayAngle)) {
                            prevCornerRayAngle -= q4;
                        } //if they are reversed
                        countRay = prevCornerRayAngle;

                    }
                    doBreak = true;
                }
            }
            if (doBreak) {
                doBreak = false;
                break;
            }
        }
        while (true);
        countRay -= rayStep;
        currentRay = countRay % q4;
    }
    while (countRay > startRay);
    wallList = wallList.sort(sortRay);
}

function sortRay(a, b) {
    return b.D - a.D
}
window.onload = setup;