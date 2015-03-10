MapPopulator = function() {

}

MapPopulator.prototype.populate = function(map) {
	for(var i = 0; i < 30; i++) {
		this.createDrunk(map);
	}
	
	for(var i = 0; i < 30; i++) {
		var e = Game.EntityFactory.create('guard');
		var pos = map.getRandomFloorPosition();
		e.setPosition(pos.x, pos.y);
		map.addEntity(e);
	}
	
	for(var i = 0; i < 40; i++) {
		var it = Game.ItemFactory.createRandom();
		var pos = map.getRandomFloorPosition();
		map.getTile(pos.x, pos.y).addItem(it);
	}
}

MapPopulator.prototype.createDrunk = function(map) {
	var e = Game.EntityFactory.create('drunk');
	var pos = map.getRandomFloorPosition();
	e.setPosition(pos.x, pos.y);
	map.addEntity(e);
	if(ROT.RNG.getUniform() > 0.01) {
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