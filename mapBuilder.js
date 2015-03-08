Game.MapBuilder = function() {

}

Game.MapBuilder.prototype.create = function() {
	var t = [[]];
	for(var y = 0; y < Game.getScreenHeight(); y++) {
		t[y] = [];
		for(var x = 0; x < Game.getScreenWidth(); x++) {
			var tile = ROT.RNG.getUniform() < 0.2 ? new Game.Tile(Game.Tiles.WallTileTemplate) : new Game.Tile(Game.Tiles.FloorTileTemplate);
			tile.setPosition(x, y);
			t[y][x] = tile;
		}
	}
	
	this._map = new Game.Map(t);
	
	return this._map;
}
