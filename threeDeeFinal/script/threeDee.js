var fps, background, floor, wallDiv, viewPort, map,
        mapSizeX, mapSizeY,
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
        turn = 0, move = 0, fire = 0, strafe = 0,
        gameEnd = 0,
        spriteLoop = 3, spriteLoopCount = 0,
        wallList = [],
        randMovCount = 0, randMovI = 0,
        miniMapCellSize,
        oldPxForMiniMap, oldPyForMiniMap,
        startEnemyId = 100, firstSpriteID,
        enemyList = [], spriteList = [], respawnList = [],
        fpsCount = 0, ts = 0;
        //walkCount = 5, walkCountI = 0, walkCN = 0;

var player = {
    health: 100,
    attack: 100,
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

var maps = [
    {
        mapData: [
            [1,2,1,2,1,2,1,2,1,1],
            [1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,1],
            [1,1,2,1,2,1,2,1,2,1]
        ],
        sizeX: 8192,
        sizeY: 8192,
        cellWidth: 256,
        cell2n: 8,
        name: "Level 1",
        horizonImage: "./img/background.jpg",
        maxLeft: -7200,
        floorImage: "./img/floor1.jpg",
        startX: 640,
        startY: 640,
        initialEnemies: [
            //{cx: 8, mx: 64, cy: 8, my: 192, typ: 0, id: 0, rot: 9, trkPos: 0, trkDat:[ 2, 64, -1, 8]},
            {cx: 8, mx: 128, cy: 2, my: 128, typ: 0, id: 0, rot: 1, trkPos: 0, trkDat:[ 2, 64, -1, 8]}
        ],
        initialPickups: [
            {cx: 2, mx: 128, cy: 6, my: 128, pickupID: 0},
            {cx: 4, mx: 128, cy: 6, my: 128, pickupID: 2},
            {cx: 6, mx: 128, cy: 6, my: 128, pickupID: 3}
        ]
    }
];

var pickups = [
    {
        wepID: 0,
        damage: 5,
        fireRate: 4,
        initialAmmo: 20,
        maxAmmo: 100,
        fn: "../img/wand.png",
        tp: true,
        typ: 5,
        after: 0,
        onPickup: equip
    },
    {
        wepID: 1,
        damage: 10,
        fireRate: 2,
        initialAmmo: 15,
        maxAmmo: 50,
        fn: "../img/staff.png",
        tp: true,
        typ: 5,
        after: 0,
        onPickup: equip
    },
    {
        ammoInc: 20,
        respawn: 5,
        baseRespawn: 5,
        fn: "../img/ammoPack.png",
        tp: true,
        typ: 5,
        after: 0,
        onPickup: reload
    },
    {
        ammoInc: 40,
        respawn: 5,
        baseRespawn: 5,
        fn: "../img/bigAmmoPack.png",
        tp: true,
        typ: 5,
        after: 0,
        onPickup: reload
    }
];

var enemies = [
    {
        id: 0,
        fn: "zombie1.png",
        tp: true,
        top: 0,
        typ: 4,
        hp: 100,
        spd: 10,
        atkDist: 512,
        rndDist: 756,
        movTyp: 0, //0 is route, 1 is random, 2 is attack
    },

];

var cells = [
    {
        typ: 0,
        tp: true,
        mapCol: "gray"
    },
    {
        typ: 1,
        fn: "wall2window.jpg",
        tp: false,
        mapCol: "green"
    },
    {
        typ: 1,
        fn: "wall2.jpg",
        tp: false,
        mapCol: "blue"
    },
    {
        typ: 1,
        fn: "wall3.jpg",
        tp: false,
    },
    {
        typ: 2,
        fn: "wall3Door.jpg",
        tp: false
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
    //create image
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

    mapSizeX = map.sizeX;
    mapSizeY = map.sizeY;
    cellSize = map.cellWidth;
    halfCW = cellSize / 2;
    cell2n = map.cell2n;
    player.X = map.startX;
    player.Y = map.startY;
    maxLeft = map.maxLeft;
    miniMapCellSize = (8.75/cellSize);
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
        unravelEnemyPath(cells[startEnemyId]);
        map.mapData[thisEnemy.cx][thisEnemy.cy] = startEnemyId;
        startEnemyId++;
    }
    spriteList = map.initialPickups;
    firstSpriteID = startEnemyId;
    for (i = 0; i < spriteList.length; i++) {
        var thisSprite = spriteList[i];
        cells[startEnemyId] = copy(pickups[thisSprite.pickupID]);
        cells[startEnemyId].mx = thisSprite.mx;
        cells[startEnemyId].my = thisSprite.my;
        cells[startEnemyId].cx = thisSprite.cx;
        cells[startEnemyId].cy = thisSprite.cy;
        cells[startEnemyId].mapId = startEnemyId;
        map.mapData[thisSprite.cx][thisSprite.cy] = startEnemyId;
        startEnemyId++;
    }
    updateView();
    genMap();
    //setup keys
    setUpKeys();
    setInterval(gameLoop, 10);
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
    fire = 0;
    strafe = 0;
}

function keyDownHandler(e) {
    var kc = e.keyCode;
    if (kc == 65) {
        strafe = 1;
    }
    if (kc == 87) {
        move = 1;
    }
    if (kc == 68) {
        strafe = -1;
    }
    if (kc == 83) {
        move = -1;
    }
    if (kc == 32) {
        fire = 1;
    }
    if (kc == 13) {
        gameEnd = 1;
    }
    if (kc == 39) {
        turn = -1;
    }
    if (kc == 37) {
        turn = 1;
    }
}

function keyUpHandler(e) {
    var kc = e.keyCode;
    if (kc == 65) {
        strafe = 0;
    }
    if (kc == 87) {
        move = 0;
    }
    if (kc == 68) {
        strafe = 0;
    }
    if (kc == 83) {
        move = 0;
    }
    if (kc == 32) {
        fire = 0;
    }
    if (kc == 39) {
        turn = 0;
    }
    if (kc == 37) {
        turn = 0;
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
    var wep = cells[map.mapData[player.cellX][player.cellY]];
    player.weapon = wep;
    player.ammo = wep.initialAmmo;
    cells.splice(wep.mapId, 1, null);
    map.mapData[player.cellX][player.cellY] = wep.after;
}

function reload() {
    if (player.weapon !== null) {
        var ammoPack = cells[map.mapData[player.cellX][player.cellY]];
        if (player.ammo == player.weapon.maxAmmo) return;
        ammoPack.respawn = ammoPack.baseRespawn;
        player.ammo += ammoPack.ammoInc;
        player.ammo = (player.ammo > player.weapon.maxAmmo) ? player.weapon.maxAmmo : player.ammo;
        respawnList.push(ammoPack);
        map.mapData[player.cellX][player.cellY] = ammoPack.after;
    }
}

function respawnTimer() {
    var item;
    for (var i = 0; i < respawnList.length; i++) {
        item = respawnList[i];
        item.respawn--;
        if (item.respawn === 0) {
            map.mapData[item.cx][item.cy] = item.mapId;
            respawnList.splice(i, 1);
        }
    }
}

function doMove() {
    var movDir, strafeDir, newMapX, newMapY, moveInc = 10;
    var CMC, CMCCell, mapX, mapY;
    var playerDX, playerDY;

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
            CMC = map.mapData[player.cellX][player.cellY];
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.typ == 1)) {
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
            CMC = map.mapData[player.cellX][player.cellY];
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.typ == 1)) {
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
        if (cells[map.mapData[player.cellX][player.cellY]].onPickup) {
            cells[map.mapData[player.cellX][player.cellY]].onPickup();
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
            CMC = map.mapData[player.cellX][player.cellY];
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.typ == 1)) {
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
            CMC = map.mapData[player.cellX][player.cellY];
            CMCCell = cells[CMC];
            if (CMC && (CMCCell.typ == 1)) {
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
        //check frequency
        //check for type of attack
        //add to bullet list
    }
}

function gameLoop() {
    var tNow = new Date().getSeconds();
    if (ts != tNow) {
        fps.innerHTML = fpsCount + "fps";
        fpsCount = 0;
        respawnTimer();
    }
    else {
        fpsCount++;
    }
    ts = tNow;
    doMove();
    //check for respawn
    //update any player bullets
    //check for enemy death
    //update position, rotation and attack of enemies
    if (spriteLoopCount == spriteLoop) {
        moveEnemies();
        spriteLoopCount = 0;
    }
    spriteLoopCount++;
    //check for game end (end of level / player death)
    //check for power ups / weapons / ammo
    updateView();
    //update status bar
}

function genMap() {
    var i, j;
    var div;
    for (i = 0; i < map.mapData.length; i++) {
        for (j = 0; j < map.mapData.length; j++) {
            div = document.createElement("div");
            if (map.mapData[i][j] < 99) {
                div.style.backgroundColor = cells[map.mapData[i][j]].mapCol;
            } else {
                div.style.backgroundColor = cells[0].mapCol;
            }
            div.style.top = Math.ceil(i * 8.75 + (miniMapCellSize * ((map.mapData.length*256) - map.startX))) + "px";
            div.style.left = Math.ceil(j * 8.75 + (miniMapCellSize * ((map.mapData.length*256) - map.startY))) + "px";
            div.className = "mapCell";
            div.id = i + "," + j;
            document.getElementById("map").appendChild(div);
        }
    }
    document.getElementById("map").style.transform = "rotate(" + (-playerFacingAngle-90) + "deg)";
    var px = player.X >>> 8, py = player.Y >>> 8;
    document.getElementById(px + "," + py).style.backgroundColor = "white";
}

function updateMap() {
    var list = document.getElementsByClassName("mapCell");
    var px = player.X >>> 8, py = player.Y >>> 8;
    document.getElementById(px + "," + py).style.backgroundColor = "white";
    if ((oldPxForMiniMap != px || oldPyForMiniMap != py) && oldPyForMiniMap !== undefined) {
        if (map.mapData[oldPxForMiniMap][oldPyForMiniMap] < 99) {
            document.getElementById(oldPxForMiniMap + "," + oldPyForMiniMap).style.backgroundColor = cells[map.mapData[oldPxForMiniMap][oldPyForMiniMap]].mapCol;
        } else {
            document.getElementById(oldPxForMiniMap + "," + oldPyForMiniMap).style.backgroundColor = cells[0].mapCol;
        }
    }
    document.getElementById("map").style.transform = "rotate(" + (-playerFacingAngle-90) + "deg)";
    for (var i = 0; i < list.length; i++) {
        list[i].style.transform = "translate(" + Math.ceil((player.Y-map.startY)*miniMapCellSize*-1)+ "px," + Math.ceil((player.X-map.startX)*miniMapCellSize*-1) +"px)";
    }
    oldPxForMiniMap = px;
    oldPyForMiniMap = py;
}

function unravelEnemyPath(e) {
    var path = [];
    var pathPos, newPathPos = 0, moveType;
    for (pathPos = 0; pathPos < e.trkDat.length; pathPos += 2) {
        moveType = e.trkDat[pathPos];
        for (var j = 0; j < e.trkDat[pathPos+1]; j++) {
            path[newPathPos] = moveType;
            newPathPos++;
        }
    }
    e.trkDat = path;
}

function moveEnemies() {
    var i, e;
    var ex, ey, ed;
    var spriteAng, mov;
    for (i = 100; i < firstSpriteID; i++) {
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
    /*if (walkCountI == walkCount) {
        walkCountI = 0;
        walkCN++;
        if (walkCN == 6) walkCN = 0;
    } else {
        walkCountI++
    }
    e.CN = "walk" + walkCN;*/
    map.mapData[e.cx][e.cy] = 0;
    dy = Math.cos((e.rot - 1) * pi8) * e.spd;
    dx = -Math.sin((e.rot - 1) * pi8) * e.spd;
    if (dy > 0) {
        if ((e.my + dy) > halfCW) {
            if (cells[map.mapData[e.cx][e.cy + 1]].tp) {
                if ((e.my + dy) > cellSize) {
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
            if (cells[map.mapData[e.cx][e.cy - 1]].tp) {
                if ((e.my + dy) < 0) {
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
            if (cells[map.mapData[e.cx + 1][e.cy]].tp) {
                if ((e.mx + dx) > cellSize) {
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
            if (cells[map.mapData[e.cx - 1][e.cy]].tp) {
                if ((e.mx + dx) < 0) {
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
    map.mapData[e.cx][e.cy] = id;
}

function render() {
    var i, wli, tX, tZ, ang;
    var wll = wallList.length;
    var topOffset = 101;
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
            tX = wli.X;
            tZ = -wli.Z;
            wli.div.style.transform = 'rotatey(' + wli.R + 'deg) rotatex(0deg) translateX(' + tX + 'px) translateY(' + topOffset + 'px) translateZ(' + tZ + 'px)';
            wallDiv.appendChild(wli.div);
        }
        else {
            wli.img = document.createElement("IMG");
            wli.img.className = "wallTile";
            wli.img.src = "./img/" + wli.fn;

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
            prevCornerY, prevCornerRayX, prevCornerRayY, prevCornerRayAngle;

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
            if ((rayPixelPosX < 0) || (rayPixelPosY < 0) || (rayPixelPosX > mapSizeX) || (rayPixelPosY > mapSizeY)) {
                break;
            }
            CMC = map.mapData[rayCellPosX][rayCellPosY];
            CMCCell = cells[CMC];

            if (CMC) {
                if (CMCCell.typ < 3) { //wall or door
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
                        break;
                    }
                    if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock)) {
                        continue;
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
                            dat.fn = CMCCell.fn;
                            dat.typ = CMCCell.typ;
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
                            dat.fn = CMCCell.fn;
                            dat.typ = CMCCell.typ;
                            wallList.push(dat);
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
                            var adj = Math.sin(theta * pi180) * 750;
                            var hyp = Math.sqrt(adj * adj + 250 * 250);

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
                            dat.X = -adj;
                            dat.Z = -1100 + dist + hyp;
                            dat.D = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                            dat.W = halfCW;
                            dat.fn = CMCCell.fn;
                            dat.typ = CMCCell.typ;
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
                break;
            }
        }
        while (true);
        countRay += rayStep;
        currentRay = countRay % q4;
    }
    while (countRay < endRay);

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
            if ((rayPixelPosX < 0) || (rayPixelPosY < 0) || (rayPixelPosX > mapSizeX) || (rayPixelPosY > mapSizeY)) {
                break;
            }
            CMC = map.mapData[rayCellPosX][rayCellPosY];
            CMCCell = cells[CMC];

            if (CMC) {
                if (CMCCell.typ < 3) { //wall or door
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
                        break;
                    }
                    if ((oldRayCellPosX == rayCellPosX) && (oldRayCellPosY == rayCellPosY) && (clockwise == oldClock)) {
                        continue;
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
                            dat.fn = CMCCell.fn;
                            dat.typ = CMCCell.typ;
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
                            dat.fn = CMCCell.fn;
                            dat.typ = CMCCell.typ;
                            if (CMCCell.rot) {
                                dat.CN = "rot" + CMCCell.rot;
                            }
                            wallList.push(dat);
                        }
                    }
                }
            }
            else { //sprite

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