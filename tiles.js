Game.Tile = function(properties) {
	properties = properties || {};
	Game.Glyph.call(this, properties);
	this._walkable = properties['walkable'] || false;
	this._blocksLight = properties['blocksLight'] != 'undefined' ? properties['blocksLight'] : true;
	this._canHavePeeOnIt = properties['canHavePeeOnIt'] != undefined ? properties['canHavePeeOnIt'] : true; // BY DEFAULT EVERY TILE CAN HAVE PEE ON THEM!!
	this._items = [];
	this._map = null;
	this._x = 0;
	this._y = 0;
}
Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.getX = function() {
	return this._x;
}
Game.Tile.prototype.getY = function() {
	return this._y;
}
Game.Tile.prototype.setPosition = function(x, y) {
	this._x = x;
	this._y = y;
}

Game.Tile.prototype.getPeedOn = function() {
	if(this.hasPeeOnIt()) {
		var dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
		dirs = dirs.randomize();
		this.getMap().getTile(this.getX()+dirs[0].x, this.getY()+dirs[0].y).getPeedOn();
	}
	else if(this._canHavePeeOnIt) {
		Game.Glyph.prototype.getPeedOn.call(this);
	}
	
	for(var i = 0; i < this._items.length; i++) {
		this._items[i].getPeedOn();
	}
}

Game.Tile.prototype.setMap = function(map) {
	this._map = map;
}
Game.Tile.prototype.getMap = function() {
	return this._map;
}

Game.Tile.prototype.isWalkable = function() {
	return this._walkable;
}
Game.Tile.prototype.blocksLight = function() {
	return this._blocksLight;
}

Game.Tile.prototype.addItem = function(item) {
	this._items.push(item);
}
Game.Tile.prototype.removeItemAt = function(index) {
	if(index >= 0 && index < this._items.length) {
		this._items.splice(index, 1);
	}
}
Game.Tile.prototype.removeItem = function(item) {
	var indx = this._items.indexOf(item);
	this.removeItemAt(indx);
}
Game.Tile.prototype.getItems = function() {
	return this._items;
}

Game.Tiles = {};
Game.Tiles.nullTile = new Game.Tile({ canHavePeeOnIt: false });
Game.Tiles.FloorTileTemplate = { name: "floor", character: '.', walkable: true, blocksLight: false };
Game.Tiles.WallTileTemplate = { name: "wall", character: '#', blocksLight: true, canHavePeeOnIt: false };
