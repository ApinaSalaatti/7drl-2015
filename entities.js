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
	var tile = this.getMap().getTile(x, y);
	if(!tile.isWalkable()) {
		if(tile.hasComponent('Interactable')) {
			tile.interact(this);
		}
		return false;
	}
	var e = this.getMap().getEntityAt(x, y);
	if(e) {
		if(e.hasComponent('Interactable')) {
			e.interact(this);
		}
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
		name: 'Player',
		character: '@',
		foreground: 'green',
		sightRadius: 20,
		components: [
			Game.Components.Peeing, Game.Components.Hands, Game.Components.Sight, Game.Components.PlayerActor, Game.Components.Wallet, Game.Components.Human,
			Game.Components.VitalStats
		]
	},
	{}
);

Game.EntityFactory.defineTemplate(
	'drunk',
	{
		name: 'Drunk',
		character: '@',
		foreground: 'brown',
		components: [Game.Components.Hands, Game.Components.Sight, Game.Components.DrunkActor, Game.Components.Human]
	},
	{ isRandomlySpawnable: true }
);
