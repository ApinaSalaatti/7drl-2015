RoomID = 0;
Room = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.id = RoomID++;
	this.nextRoomId = -1;
	this.prevRoomId = -1;
	this.sideRoomId = -1;
	this.character = '.';
}

MapBuilder = function() {
	this._iteration = 0;
}

MapBuilder.prototype.getRooms = function() {
	return this._allRooms;
}

MapBuilder.prototype.iterate = function() {
	this._iteration++;
	//console.log("ITERATION " + this._iteration + " over " + this._allRooms.length + " rooms");
	var overlaps = false;
	for(var i = 0; i < this._allRooms.length; i++) {
		var room1 = this._allRooms[i];
		var bestMag = 0;
		var bestMove = {x:0, y:0};
		var bestOther = null;
		for(var j = i+1; j < this._allRooms.length; j++) {
			var room2 = this._allRooms[j];
			var overlap = this.overlap(room1, room2);
			//console.log(overlap);
			var mag = (overlap.x*overlap.x)+(overlap.y*overlap.y);
			if(mag > bestMag) {
				bestMag = mag;
				bestMove = overlap;
				bestOther = room2;
			}
		}
		
		var overlap = bestMove;
		//console.log("MOVING ROOM " + this._allRooms[i].id);
		if(overlap.x == 0) {
			if(bestOther == null) {
				continue;
			}
			//console.log("MOVING Y " + overlap.y);
			var move1 = Math.floor(overlap.y/2);
			var move2 = overlap.y - move1;
			this._allRooms[i].y += move1;
			bestOther.y -= move2;
		}
		else if(overlap.y == 0) {
			if(bestOther == null) {
				continue;
			}
			//console.log("MOVING X " + overlap.x);
			var move1 = Math.floor(overlap.x/2);
			var move2 = overlap.x - move1;
			this._allRooms[i].x += move1;
			bestOther.x -= move2;
		}
		else {
			var ax = Math.abs(overlap.x);
			var ay = Math.abs(overlap.y);
			if(ax < ay) {
				//console.log("MOVING X " + overlap.x);
				var move1 = Math.floor(overlap.x/2);
				var move2 = overlap.x - move1;
				this._allRooms[i].x += move1;
				bestOther.x -= move2;
			}
			else {
				//console.log("MOVING Y " + overlap.y);
				var move1 = Math.floor(overlap.y/2);
				var move2 = overlap.y - move1;
				this._allRooms[i].y += move1;
				bestOther.y -= move2;
			}
		}
		
		if(bestMag > 0) {
			overlaps = true;
		}
	}
	
	//console.log("DONE");
	return overlaps;
}

MapBuilder.prototype.buildClub = function() {
	//var roomAmount = 10 + Math.floor(ROT.RNG.getUniform() * 10);
	var roomAmount = 20;
	//console.log("Creating " + roomAmount + " rooms.");
	
	this._allRooms = [];
	this._neededRooms = ['stairs', 'dancefloor', 'bar'];
	
	var x = 0;
	var y = 0;
	var s = this.getRandomSize();
	var w = s.w;
	var h = s.h;
	var startRoom = new Room(x, y, w, h);
	this._allRooms.push(startRoom);
	
	var lastDir = null;
	
	for(var i = 1; i < roomAmount; i++) {
		var lastRoom = this._allRooms[this._allRooms.length-1];
		
		// Take away the direction we came from, so we won't make overlapping rooms
		var dirs = ['left', 'right', 'up', 'down'];
		if(lastDir == 'left')
			dirs.splice(1, 1);
		else if(lastDir == 'right')
			dirs.splice(0, 1);
		else if(lastDir == 'up')
			dirs.splice(3, 1);
		else if(lastDir == 'down')
			dirs.splice(2, 1);
			
		
		// Create a side room first for the last room?
		var rand = ROT.RNG.getUniform();
		if(rand < 0.35) {
			dirs = dirs.randomize();
			var sideDir = dirs[0];
			
			// Remove the sideroom direction to reduce overlap
			if(sideDir == 'left')
				dirs.splice(0, 1);
			else if(sideDir == 'right')
				dirs.splice(1, 1);
			else if(sideDir == 'up')
				dirs.splice(2, 1);
			else if(sideDir == 'down')
				dirs.splice(3, 1);
				
			var sideSize = this.getRandomSize();
			sideSize.w -= 5;
			sideSize.h -= 5;
			
			var sw = sideSize.w;
			var sh = sideSize.h;
			var sx = 0;
			var sy = 0;
			if(sideDir == 'left') {
				sx = lastRoom.x - sw;
				sy = lastRoom.y + 8 - Math.floor(ROT.RNG.getUniform() * 16);
			}
			else if(sideDir == 'right') {
				sx = lastRoom.x + lastRoom.w;
				sy = lastRoom.y + 8 - Math.floor(ROT.RNG.getUniform() * 16);
			}
			else if(sideDir == 'up') {
				sx = lastRoom.x + 8 - Math.floor(ROT.RNG.getUniform() * 16);
				sy = lastRoom.y - sh;
			}
			else if(sideDir == 'down') {
				sx = lastRoom.x + 8 - Math.floor(ROT.RNG.getUniform() * 16);
				sy = lastRoom.y + lastRoom.h;
			}
			
			var sideRoom = new Room(x, y, w, h);
			sideRoom.character = 's';
			sideRoom.lastRoomId = lastRoom.id;
			lastRoom.sideRoomId = sideRoom.id;
			this._allRooms.push(sideRoom);
		}
		
		//console.log(lastDir);
		/*var s = '';
		for(var j = 0; j < dirs.length; j++) {
			s += dirs[j] + ',';
		}
		console.log("available dirs: " + s);
		*/
		
		// Create the next room
		dirs = dirs.randomize();
		var d = dirs[0];
		lastDir = d;
		
		//console.log("Next room goes "  + d);
		
		s = this.getRandomSize();
		w = s.w;
		h = s.h;
		if(d == 'left') {
			x = lastRoom.x - w;
			y = lastRoom.y + 4 - Math.floor(ROT.RNG.getUniform() * 8);
		}
		else if(d == 'right') {
			x = lastRoom.x + lastRoom.w;
			y = lastRoom.y + 4 - Math.floor(ROT.RNG.getUniform() * 8);
		}
		else if(d == 'up') {
			x = lastRoom.x + 4 - Math.floor(ROT.RNG.getUniform() * 8);
			y = lastRoom.y - h;
		}
		else if(d == 'down') {
			x = lastRoom.x + 4 - Math.floor(ROT.RNG.getUniform() * 8);
			y = lastRoom.y + lastRoom.h;
		}
		
		var newRoom = new Room(x, y, w, h);
		newRoom.prevRoomId = lastRoom.id;
		lastRoom.nextRoomId = newRoom.id;
		
		this._allRooms.push(newRoom);
	}
	
	// Move overlapping rooms
	var b = true;
	while(b) {
		b = this.iterate();
	}
	this.moveRooms();
	
	// Get the final width of the map
	var mapWidth = 0;
	var mapHeight = 0;
	for(var i = 0; i < this._allRooms.length; i++) {
		var ww = this._allRooms[i].x + this._allRooms[i].w;
		var hw = this._allRooms[i].y + this._allRooms[i].h;
		
		//console.log(this._allRooms[i]);
		//console.log("roomw: " + ww + " roomh: " + hw + " vs " + mapWidth + ", " + mapHeight); 
		
		if(ww > mapWidth) mapWidth = ww;
		if(hw > mapHeight) mapHeight = hw;
	}
	
	var map = [[]];
	for(var y = 0; y < mapHeight; y++) {
		map[y] = [];
		for(var x = 0; x < mapWidth; x++) {
			map[y][x] = Game.TileFactory.create('wall');
		}
	}
	
	//console.log("map dimensions: " + mapWidth + " x " + mapHeight);
	
	var rooms = this._allRooms;
	for(var i = 0; i < rooms.length; i++) {
		var r = rooms[i];
		for(var y = r.y; y < r.y+r.h; y++) {
			for(var x = r.x; x < r.x+r.w; x++) {
				if(y == r.y || y == r.y+r.h-1 || x == r.x || x == r.x+r.w-1) {
					//map[y][x] = 0;
				}
				else {
					map[y][x] = Game.TileFactory.create('floor');
				}
			}
		}
		
	}
	
	/*
	console.log("LOLOL");
	for(var i = 0; i < this._allRooms.length; i++) {
		console.log(this._allRooms[i]);
	}
	console.log("LASKFLKA");
	*/
	
	// Carve corridors
	for(var i = 0; i < this._allRooms.length; i++) {
		var r = this._allRooms[i];
		if(r.nextRoomId != -1) this.carveCorridor(r, this.getRoomWithID(r.nextRoomId), map);
		if(r.sideRoomId != -1) this.carveCorridor(r, this.getRoomWithID(r.sideRoomId), map);
	}
	
	return new Game.Map(map, this._allRooms);
}

MapBuilder.prototype.carveCorridor = function(room1, room2, map) {
	//console.log("carving corridor from " + room1.id + " to " + room2.id);
	var carveX = room1.x + Math.floor(room1.w / 2);
	var carveY = room1.y + Math.floor(room1.h / 2);
	var targetX = room2.x + Math.floor(room2.w / 2);
	var targetY = room2.y + Math.floor(room2.h / 2);
	var carveXDir = carveX < targetX ? 1 : -1;
	var carveYDir = carveY < targetY ? 1 : -1;
	
	while(carveX != targetX) {
		map[carveY][carveX] = Game.TileFactory.create('floor');
		carveX += carveXDir;
	}
	while(carveY != targetY) {
		map[carveY][carveX] = Game.TileFactory.create('floor');
		carveY += carveYDir;
	}
}

MapBuilder.prototype.getRoomWithID = function(id) {
	for(var i = 0; i < this._allRooms.length; i++) {
		if(this._allRooms[i].id == id) return this._allRooms[i];
	}
	return null;
}

MapBuilder.prototype.overlap = function(room1, room2) {
	var left1 = room1.x;
	var top1 = room1.y;
	var right1 = room1.x + room1.w - 1;
	var bottom1 = room1.y + room1.h - 1;
	var left2 = room2.x;
	var top2 = room2.y;
	var right2 = room2.x + room2.w - 1;
	var bottom2 = room2.y + room2.h - 1;
	
	if(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2) {
		//console.log("NO OVERLAP");
		return {x:0, y:0};
	}
	
	var x = 0;
	var y = 0;
	if(left1 < left2) {
		var dist = left2 - left1;
		var requiredDist = room1.w;
		x = dist - requiredDist;
	}
	else {
		var dist = left1 - left2;
		var requiredDist = room2.w;
		x = requiredDist - dist;
	}
	if(top1 < top2) {
		var dist = top2 - top1;
		var requiredDist = room1.h;
		y = dist - requiredDist;
	}
	else {
		var dist = top1 - top2;
		var requiredDist = room2.h;
		y = requiredDist - dist;
	}
	
	/*
	console.log("OVERLAP AS FOLLOWS:");
	console.log(room1);
	console.log("VS");
	console.log(room2);
	console.log("VOERLAP:");
	console.log({x:x, y:y});
	console.log("OVERLAP DATA ENDS");
	*/
	return {x:x, y:y};
}

MapBuilder.prototype.needToMove = function(rooms, index) {
	var movementX = 0;
	var movementY = 0;
	var room1 = rooms[index];
	if(!room1) return 0;
	
	for(var i = 0; i < rooms.length; i++) {
		if(i == index) continue; // Don't check yourself
		
		room2 = rooms[i];
		
		if(!room2) continue;
		
		//console.log(room1);
		//console.log(room2);
		
		var left1 = room1.x;
		var top1 = room1.y;
		var right1 = room1.x + room1.w;
		var bottom1 = room1.y + room1.h;
		var left2 = room2.x;
		var top2 = room2.y;
		var right2 = room2.x + room2.w;
		var bottom2 = room2.y + room2.h;
		
		if(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2) {
			continue;
		}
		
		//console.log("WE HAVE COLLISION");
		if(left1 < left2) {
			// Move left
			//console.log("MOVE LEFT");
			var neededDist = room1.w + 1; // 1 cell for wall
			//console.log("NEEDED: " + neededDist);
			var currentDist = left2 - left1;
			//console.log("CURRENT: " + currentDist);
			movementX = currentDist - neededDist;
			break;
		}
		else {
			// Move right
			console.log("MOVE RIGHT");
			var neededDist = room2.w + 1;
			var currentDist = left1 - left2;
			movementX = neededDist - currentDist;
			break;
		}
		
		// Y movement
		if(top1 < top2) {
			// Move up
			var neededDist = room1.h + 1;
			var currentDist = top2 - top1;
			movementY = currentDist - neededDist;
		}
		else {
			// Move down
			var neededDist = room2.h + 1;
			var currentDist = top1 - top2;
			movementY = neededDist - currentDist;
		}
	}
	
	return {x: movementX, y: movementY};
}

MapBuilder.prototype.getRandomSize = function() {
	var w = 20 + Math.floor(ROT.RNG.getUniform() * 15);
	var h = 10 + Math.floor(ROT.RNG.getUniform() * 15);
	
	return { w:w, h:h };
}

MapBuilder.prototype.moveRooms = function() {
	var lowestX = 0; // We only care if a room is below 0
	var lowestY = 0;
	for(var i = 0; i < this._allRooms.length; i++) {
		if(this._allRooms[i].x < lowestX) lowestX = this._allRooms[i].x;
		if(this._allRooms[i].y < lowestY) lowestY = this._allRooms[i].y;
	}
	
	if(lowestX < 0) {
		lowestX = -lowestX;
		for(var i = 0; i < this._allRooms.length; i++) {
			this._allRooms[i].x += lowestX;
		}
	}
	if(lowestY < 0) {
		lowestY = -lowestY;
		for(var i = 0; i < this._allRooms.length; i++) {
			this._allRooms[i].y += lowestY;
		}
	}
}