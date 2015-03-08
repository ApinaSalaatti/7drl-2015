Game.Entity = function(id, properties) {
	properties = properties || {};
	Game.GameObject.call(this, id, properties);
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._map = null;
}
Game.Entity.extend(Game.GameObject);

Game.Entity.prototype.setMap = function(map) {
	this._map = map;
}
Game.Entity.prototype.getMap = function() {
	return this._map;
}

Game.Entity.prototype.getX = function() {
	return this._x;
}
Game.Entity.prototype.getY = function() {
	return this._y;
}
Game.Entity.prototype.setPosition = function(x, y) {
	this._x = x;
	this._y = y;
}

Game.Entity.prototype.tryMove = function(x, y) {
	if(!this.getMap().getTile(x, y).isWalkable()) {
		return false;
	}
	var e = this.getMap().getEntityAt(x, y);
	if(e) {
		// TODO Do stuff like attack here
		return false;
	}
	
	this.setPosition(x, y);
	return true;
}

/*
 * Factory stuff and templates and important things
 */
Game.EntityFactory = new Game.Factory('entity', Game.Entity);

Game.EntityFactory.defineTemplate(
	'player',
	{
		character: '@',
		foreground: 'green',
		components: [Game.Components.Peeing]
	},
	{}
);

Game.EntityFactory.defineTemplate(
	'drunk',
	{
		character: '@',
		foreground: 'brown'
	},
	{ isRandomlySpawnable: true }
);
