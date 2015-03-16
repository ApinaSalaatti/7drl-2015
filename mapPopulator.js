MapPopulator = function() {

}

MapPopulator.prototype.populate = function(map, player) {
	var startRoom = map.getRooms()[0];
	var pos = map.getRandomFloorPositionWithin(startRoom.x, startRoom.y, startRoom.w, startRoom.h);
	player.setPosition(pos.x, pos.y);
	map.addEntity(player);
	
	this.createToiletAndLine(map);
	
	for(var i = 0; i < 60; i++) {
		this.createTable(map);
	}
	
	for(var i = 0; i < 320; i++) {
		this.createDrunk(map);
	}
	
	for(var i = 0; i < 10; i++) {
		this.createBar(map);
	}
	
	
	for(var i = 0; i < 50; i++) {
		this.createGuard(map);
	}
	
	/*
	for(var i = 0; i < 3; i++) {
		this.createSlotMachine(map);
	}*/
	
	for(var i = 0; i < 50; i++) {
		var it = Game.ItemFactory.createRandom();
		var pos = map.getRandomTile('table');
		if(pos)
			map.getTile(pos.x, pos.y).addItem(it);
		else
			break;
	}
	for(var i = 0; i < 10; i++) {
		var it = Game.ItemFactory.createRandom();
		var pos = map.getRandomTile('floor');
		if(pos)
			map.getTile(pos.x, pos.y).addItem(it);
		else
			break;
	}
	
	this.placeDiscoLights(map);
}

MapPopulator.prototype.createSlotMachine = function(map) {
	var rooms = map.getRooms();
	var r = Math.floor(ROT.RNG.getUniform() * (rooms.length-1));
	
	var room = rooms[r];
	
	var pos = map.getRandomFloorPositionWithin(room.x+2, room.y+2, room.w-4, room.h-4); // Avoid edges to not block corridors
	if(pos) {
		var sm = Game.EntityFactory.create('slotMachine');
		sm.setPosition(pos);
		map.addEntity(sm);
	}
}

MapPopulator.prototype.placeDiscoLights = function(map) {
	var db = [];
	var rooms = map.getRooms();
	for(var i = 0; i < rooms.length; i++) {
		var cx = rooms[i].x + Math.floor(rooms[i].w/2);
		var cy = rooms[i].y + Math.floor(rooms[i].h/2);
		if(ROT.RNG.getUniform() < 2) {
			db.push({ x: cx, y: cy });
		}
	}
	
	map.setDiscoBalls(db);
}

MapPopulator.prototype.createTable = function(map) {
	var tiles = [];
	var rooms = map.getRooms();
	var k = Object.keys(rooms).random();
	var r = rooms[k];
	var pos = map.getRandomFloorPositionWithin(r.x, r.y, r.w, r.h);
	tiles.push(pos);
	tiles.push({x:pos.x+1, y:pos.y});
	tiles.push({x:pos.x, y:pos.y+1});
	tiles.push({x:pos.x+1, y:pos.y+1});
	
	for(var i = 0; i < tiles.length; i++) {
		map.setTile(tiles[i].x, tiles[i].y, Game.TileFactory.create('table'));
	}
	
	if(map.getTile(pos.x-1, pos.y).getName() == 'floor') {
		map.setTile(pos.x-1, pos.y, Game.TileFactory.create('chair'));
	}
	if(map.getTile(pos.x+1, pos.y-1).getName() == 'floor') {
		map.setTile(pos.x+1, pos.y-1, Game.TileFactory.create('chair'));
	}
}

MapPopulator.prototype.createGuard = function(map) {
	var rooms = map.getRooms();
	var k = Object.keys(rooms).random();
	var r = rooms[k];
	var pos = map.getRandomFloorPositionWithin(r.x+1, r.y+1, r.w-1, r.h-1); // Not on the edges (i.e. walls and corridors)
	
	// Check the guard is not blocking a corridor
	if(!map.getTile(pos.x+1, pos.y).isWalkable() && !map.getTile(pos.x-1, pos.y).isWalkable()) {
		return;
	}
	if(!map.getTile(pos.x, pos.y+1).isWalkable() && !map.getTile(pos.x, pos.y-1).isWalkable()) {
		return;
	}
	
	var e = Game.EntityFactory.create('guard');
	e.setPosition(pos.x, pos.y);
	map.addEntity(e);
}

MapPopulator.prototype.createBar = function(map) {
	var rooms = map.getRooms();
	var k = Object.keys(rooms).random();
	var r = rooms[k];
	var pos = map.getRandomFloorPositionWithin(r.x+2, r.y+3, r.w-4, r.h-6); // Not on the edges (i.e. walls and corridors)
	var cx = r.x + Math.floor(r.w/2);
	var cy = r.y + Math.floor(r.h/2);
	
	var bx;
	// Spawn some table to pose as a bar
	if(pos.x < cx) {
		bx = pos.x+1;
	}
	else {
		bx = pos.x-1;
	}
	for(var i = -2; i < 3; i++) {
		map.setTile(bx, pos.y+i, Game.TileFactory.create('table'));
	}
	
	var e = Game.EntityFactory.create('bartender');
	e.setPosition(pos.x, pos.y);
	map.addEntity(e);
}

MapPopulator.prototype.createDrunk = function(map) {
	var e = Game.EntityFactory.create('drunk');
	var pos = map.getRandomFloorPosition();
	e.setPosition(pos.x, pos.y);
	map.addEntity(e);
	if(ROT.RNG.getUniform() > 0.3) {
		// Try to spawn a beer owned by this drunk nearby
		for(var y = -3; y <= 3; y++) {
			for(var x = -3; x <= 3; x++) {
				var bX = e.getX() + x;
				var bY = e.getY() + y;
				if(map.isEmptyFloor(bX, bY)) {
					var beer = Game.ItemFactory.create('beer');
					map.getTile(bX, bY).addItem(beer);
					e.setOwnedDrink(beer);
					return;
				}
			}
		}
	}
}

MapPopulator.prototype.createToiletAndLine = function(map) {
	var room = map.getRooms()[map.getRooms().length-1];
	
	var sides = ['left', 'right', 'top', 'bottom'];
	sides = sides.randomize();
	var side = sides[0];
	
	var tx = 0;
	var ty = 0;
	
	if(side == 'left') {
		tx = room.x;
		for(var i = 1; i < room.w; i++) { // y starts at 1 so we don't make a door in a corner
			if(map.getTile(tx, room.y+i).getName() == 'wall' && map.getTile(tx, room.y+i-1).getName() == 'wall' && map.getTile(tx, room.y+i+1).getName() == 'wall') {
				ty = room.y+i;
				break;
			}
		}
		map.setTile(tx, ty, Game.TileFactory.create('floor'));
		map.setTile(tx-1, ty, Game.TileFactory.create('toilet'));
		map.setTile(tx-2, ty, Game.TileFactory.create('wall'));
		map.setTile(tx-2, ty-1, Game.TileFactory.create('wall'));
		map.setTile(tx-2, ty+1, Game.TileFactory.create('wall'));
		
		for(var i = 0; i < 5; i++) {
			this.placeQueuer(tx+i, ty, i, map);
		}
	}
	else if(side == 'right') {
		tx = room.x + room.w - 1;
		for(var i = 1; i < room.w; i++) { // y starts at 1 so we don't make a door in a corner
			if(map.getTile(tx, room.y+i).getName() == 'wall' && map.getTile(tx, room.y+i-1).getName() == 'wall' && map.getTile(tx, room.y+i+1).getName() == 'wall') {
				ty = room.y+i;
				break;
			}
		}
		map.setTile(tx, ty, Game.TileFactory.create('floor'));
		map.setTile(tx+1, ty, Game.TileFactory.create('toilet'));
		map.setTile(tx+2, ty, Game.TileFactory.create('wall'));
		map.setTile(tx+2, ty-1, Game.TileFactory.create('wall'));
		map.setTile(tx+2, ty+1, Game.TileFactory.create('wall'));
		
		for(var i = 0; i < 5; i++) {
			this.placeQueuer(tx-i, ty, i, map);
		}
	}
	else if(side == 'top') {
		ty = room.y;
		for(var i = 1; i < room.h; i++) { // y starts at 1 so we don't make a door in a corner
			if(map.getTile(room.x+i, ty).getName() == 'wall' && map.getTile(room.x+i-1, ty).getName() == 'wall' && map.getTile(room.x+i+1,  ty).getName() == 'wall') {
				tx = room.x+i;
				break;
			}
		}
		map.setTile(tx, ty, Game.TileFactory.create('floor'));
		map.setTile(tx, ty-1, Game.TileFactory.create('toilet'));
		map.setTile(tx, ty-2, Game.TileFactory.create('wall'));
		map.setTile(tx-1, ty-2, Game.TileFactory.create('wall'));
		map.setTile(tx+1, ty-2, Game.TileFactory.create('wall'));
		
		for(var i = 0; i < 5; i++) {
			this.placeQueuer(tx, ty+i, i, map);
		}
	}
	else if(side == 'bottom') {
		ty = room.y + room.h - 1;
		for(var i = 1; i < room.h; i++) { // y starts at 1 so we don't make a door in a corner
			if(map.getTile(room.x+i, ty).getName() == 'wall' && map.getTile(room.x+i-1, ty).getName() == 'wall' && map.getTile(room.x+i+1,  ty).getName() == 'wall') {
				tx = room.x+i;
				break;
			}
		}
		map.setTile(tx, ty, Game.TileFactory.create('floor'));
		map.setTile(tx, ty+1, Game.TileFactory.create('toilet'));
		map.setTile(tx, ty+2, Game.TileFactory.create('wall'));
		map.setTile(tx-1, ty+2, Game.TileFactory.create('wall'));
		map.setTile(tx+1, ty+2, Game.TileFactory.create('wall'));
		
		for(var i = 0; i < 5; i++) {
			this.placeQueuer(tx, ty-i, i, map);
		}
	}
}

MapPopulator.prototype.placeQueuer = function(x, y, placeInLine, map) {
	var q = Game.EntityFactory.create('queuer');
	q.setPosition(x, y);
	q.setPlaceInLine(placeInLine);
	map.addEntity(q);
}