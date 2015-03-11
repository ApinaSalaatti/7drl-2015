Game.Entity = function(id, properties) {
	properties = properties || {};
	Game.GameObject.call(this, id, properties);
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._map = null;
	this._dead = false;
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

Game.Entity.prototype.isDead = function() {
	return this._dead;
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
		if(e.hasComponent('Attacker') && e.isAggressive()) {
			this.attack(e);
		}
		else if(this.hasComponent('PlayerActor') && e.hasComponent('Interactable')) {
			e.interact(this);
		}
		return false;
	}
	
	var oldTile = this.getMap().getTile(this.getX(), this.getY());
	this.setPosition(x, y);
	var newTile = this.getMap().getTile(this.getX(), this.getY());
	
	if(oldTile.getName() != 'table' && newTile.getName() == 'table') {
		this.raiseEvent('onJumpOnTable');
	}
	else if(oldTile.getName() == 'table' && newTile.getName() != 'table') {
		this.raiseEvent('onJumpOffTable');
	}
	
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
		hitChance: 0.8,
		health: 20,
		attackPower: 5,
		components: [
			Game.Components.Peeing, Game.Components.Hands, Game.Components.Sight, Game.Components.PlayerActor, Game.Components.Wallet, Game.Components.Human,
			Game.Components.VitalStats, Game.Components.Health, Game.Components.Attacker
		]
	},
	{}
);

Game.EntityFactory.defineTemplate(
	'drunk',
	{
		name: 'Drunk',
		character: 'D',
		foreground: 'blue',
		sightRadius: 15,
		hitChance: 0.3,
		health: 5,
		attackPower: 3,
		attackMessage: 'swings drunkenly at',
		components: [
			Game.Components.Hands, Game.Components.Sight, Game.Components.DrunkActor, Game.Components.Human, Game.Components.Health, Game.Components.Attacker,
			Game.Components.DrunkInteractable
		]
	},
	{ isRandomlySpawnable: true }
);

Game.EntityFactory.defineTemplate(
	'guard',
	{
		name: 'Guard',
		character: 'G',
		foreground: 'red',
		sightRadius: 30,
		hitChance: 0.7,
		attackPower: 7,
		health: 10,
		components: [Game.Components.Hands, Game.Components.Sight, Game.Components.GuardActor, Game.Components.Human, Game.Components.Health, Game.Components.Attacker]
	},
	{ isRandomlySpawnable: true }
);

Game.EntityFactory.defineTemplate(
	'bartender',
	{
		name: 'Bartender',
		character: 'B',
		foreground: 'yellow',
		sightRadius: 30,
		components: [Game.Components.Hands, Game.Components.Sight, Game.Components.BartenderInteractable, Game.Components.Human]
	},
	{ isRandomlySpawnable: true }
);