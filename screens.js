Game.Screens = {};

Game.Screens.startScreen = {
	enter: function() {
	
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screens.playScreen);
			}
		}
	},
	render: function(display) {
		display.drawText(1, 1, "Press ENTER to play!");
	}
};

Game.Screens.playScreen = {
	_map: null,
	_player: null,
	
	enter: function() {
		this._player = Game.EntityFactory.create('player');
		var builder = new Game.MapBuilder();
		this._map = builder.create();
		
		var pos = this._map.getRandomFloorPosition();
		this._player.setPosition(pos.x, pos.y);
		this._map.addEntity(this._player);
		
		for(var i = 0; i < 10; i++) {
			var e = Game.EntityFactory.create('drunk');
			var pos = this._map.getRandomFloorPosition();
			e.setPosition(pos.x, pos.y);
			this._map.addEntity(e);
		}
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_UP) {
				this._player.tryMove(this._player.getX(), this._player.getY()-1);
			}
			else if(eventData.keyCode == ROT.VK_DOWN) {
				this._player.tryMove(this._player.getX(), this._player.getY()+1);
			}
			else if(eventData.keyCode == ROT.VK_LEFT) {
				this._player.tryMove(this._player.getX()-1, this._player.getY());
			}
			else if(eventData.keyCode == ROT.VK_RIGHT) {
				this._player.tryMove(this._player.getX()+1, this._player.getY());
			}
			else if(eventData.keyCode == ROT.VK_P) {
				this._player.pee();
			}
		}
	},
	render: function(display) {
		for(var y = 0; y < this._map.getHeight(); y++) {
			for(var x = 0; x < this._map.getWidth(); x++) {
				var t = this._map.getTile(x, y);
				display.draw(x, y, t.getCharacter(), t.getForeground(), t.getBackground());
			}
		}
		
		var entities = this._map.getEntities();
		for(var i = 0; i < entities.length; i++) {
			var e = entities[i];
			display.draw(e.getX(), e.getY(), e.getCharacter(), e.getForeground(), e.getBackground());
		}
	}
};
