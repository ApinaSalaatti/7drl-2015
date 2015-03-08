Game.Map = function(tiles) {
	this._tiles = tiles;
	this._width = tiles[0].length;
	this._height = tiles.length;
	for(var y = 0; y < tiles.length; y++) {
		for(var x = 0; x < tiles[0].length; x++) {
			tiles[y][x].setMap(this);
		}
	}
	
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	
	this._entities = [];
}

Game.Map.prototype.getWidth = function() {
	return this._width;
}
Game.Map.prototype.getHeight = function() {
	return this._height;
}
Game.Map.prototype.getTile = function(x, y) {
	if(x < 0 || x >= this.getWidth() || y < 0 || y >= this.getHeight()) {
		return Game.Tiles.nullTile;
	}
	return this._tiles[y][x];
}
Game.Map.prototype.getEngine = function() {
	return this._engine;
}

Game.Map.prototype.getEntities = function() {
	return this._entities;
}
Game.Map.prototype.addEntity = function(entity) {
	if(entity.getX() < 0 || entity.getX() >= this._width || entity.getY() < 0 || entity.getY() >= this._height) {
		throw new Error("Adding entity outside of map bounds!");
	}
	entity.setMap(this);
	this._entities.push(entity);
}
Game.Map.prototype.getEntityAt = function(x, y) {
	for(var i = 0; i < this._entities.length; i++) {
		if(this._entities[i].getX() == x && this._entities[i].getY() == y) {
			return this._entities[i];
		}
	}
	return null;
}

Game.Map.prototype.isEmptyFloor = function(x, y) {
	return this.getTile(x, y).isWalkable() && !this.getEntityAt(x, y);
}

Game.Map.prototype.getRandomFloorPosition = function() {
	// Randomly generate a tile which is a floor
	var x = 0;
	var y = 0;
	do {
		x = Math.floor(ROT.RNG.getUniform() * this.getWidth());
		y = Math.floor(ROT.RNG.getUniform() * this.getHeight());
	} while(!this.isEmptyFloor(x, y));
	return {x: x, y: y};
}
