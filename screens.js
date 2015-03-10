Game.Screens = {};

Game.Screens.startScreen = {
	enter: function() {
		Game.playerName = '';
		Game.playerGender = 'male';
		this._male = true;
		
		this._currentSelection = 0;
		this._selections = [];
		this._selections[0] = { title: 'Change gender', select: Game.Screens.startScreen.changeGender };
		this._selections[1] = { title: 'Start game', select: Game.Screens.startScreen.startGame };
	},
	exit: function() {
	
	},
	changeGender: function() {
		if(Game.playerGender == 'male') Game.playerGender = 'female';
		else if(Game.playerGender == 'female') Game.playerGender = 'other';
		else Game.playerGender = 'male';
	},
	startGame: function() {
		Game.switchScreen(Game.Screens.playScreen);
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_RETURN) {
				this._selections[this._currentSelection].select();
			}
			if(eventData.keyCode == 8) { // BACKSPACE
				if(Game.playerName.length > 0) Game.playerName = Game.playerName.substring(0, Game.playerName.length-1);
			}
			if(eventData.keyCode == ROT.VK_DOWN) {
				this._currentSelection++;
				if(this._currentSelection >= this._selections.length) this._currentSelection = 0;
			}
			if(eventData.keyCode == ROT.VK_UP) {
				this._currentSelection--;
				if(this._currentSelection < 0) this._currentSelection = this._selections.length-1;
			}
		}
		else if(eventName == 'keypress') {
			var code = eventData.charCode;
			if(code >= 65 && code <= 122) { // Only letters from a to Z
				var ch = String.fromCharCode(code);
				Game.playerName += ch;
			}
			else if(code == 32) Game.playerName += ' '; // Space
			
			if(Game.playerName.length > 30) Game.playerName = Game.playerName.substring(0, 30);
		}
		Game.refresh();
	},
	render: function(display) {
		display.drawText(1, 1, "Type in your name: " + Game.playerName);
		for(var i = 0; i < this._selections.length; i++) {
			var bg = 'black';
			if(this._currentSelection == i) bg = 'lightGrey';
			display.drawText(1, 3+i, '%b{'+bg+'}' + this._selections[i].title);
		}
		
		// Render info
		display.drawText(70, 1, Game.playerName);
		display.drawText(70, 2, Game.playerGender);
	}
};

Game.Screens.playScreen = {
	_map: null,
	_player: null,
	_subscreen: null,
	
	enter: function() {
		if(Game.playerName == null || Game.playerName == '') {
			Game.playerName = Game.NameUtilities.createRandomName();
		}
		this._player = Game.EntityFactory.create('player', {name: Game.playerName, gender: Game.playerGender});
		
		var builder = new MapBuilder();
		this._map = builder.buildClub();
		
		var pos = this._map.getRandomFloorPosition();
		this._player.setPosition(pos.x, pos.y);
		this._map.addEntity(this._player);
		
		var populator = new MapPopulator();
		populator.populate(this._map);
		
		Game.turnNumber = 0;
		this._map.getEngine().start();
	},
	exit: function() {
		this._map.getEngine().stop();
	},
	handleInput: function(eventName, eventData) {
		if(this._subscreen) {
			this._subscreen.handleInput(eventName, eventData);
			return;
		}
		
		if(eventName == 'keydown') {
			var endTurn = true;
			if(eventData.keyCode == ROT.VK_UP || eventData.keyCode == ROT.VK_L) {
				this._player.tryMove(this._player.getX(), this._player.getY()-1);
			}
			else if(eventData.keyCode == ROT.VK_DOWN || eventData.keyCode == ROT.VK_K) {
				this._player.tryMove(this._player.getX(), this._player.getY()+1);
			}
			else if(eventData.keyCode == ROT.VK_LEFT || eventData.keyCode == ROT.VK_H) {
				this._player.tryMove(this._player.getX()-1, this._player.getY());
			}
			else if(eventData.keyCode == ROT.VK_RIGHT || eventData.keyCode == ROT.VK_J) {
				this._player.tryMove(this._player.getX()+1, this._player.getY());
			}
			else if(eventData.keyCode == ROT.VK_Y) {
				this._player.tryMove(this._player.getX()-1, this._player.getY()-1);
			}
			else if(eventData.keyCode == ROT.VK_U) {
				this._player.tryMove(this._player.getX()+1, this._player.getY()-1);
			}
			else if(eventData.keyCode == ROT.VK_B) {
				this._player.tryMove(this._player.getX()-1, this._player.getY()+1);
			}
			else if(eventData.keyCode == ROT.VK_N) {
				this._player.tryMove(this._player.getX()+1, this._player.getY()+1);
			}
			else if(eventData.keyCode == ROT.VK_SPACE) {
				this._player.pee();
				this._map.broadcastEvent('somethingPeedOn', { peeingPerson: this._player });
			}
			else if(eventData.keyCode == ROT.VK_Z) {
				if(this._player.getItemInHand('left') && this._player.getItemInHand('left').hasComponent('Usable')) {
					Game.addMessage(this._player.getName() + " " + this._player.getItemInHand('left').getUsingMessage());
					this._player.useItem('left');
				}
			}
			else if(eventData.keyCode == ROT.VK_X) {
				if(this._player.getItemInHand('right') && this._player.getItemInHand('right').hasComponent('Usable')) {
					Game.addMessage(this._player.getName() + " " + this._player.getItemInHand('right').getUsingMessage());
					this._player.useItem('right');
				}
			}
			else if(eventData.keyCode == ROT.VK_P) {
				var items = this._map.getTile(this._player.getX(), this._player.getY()).getItems();
				if(items.length > 0) {
					if(this._player.pickItem(items[items.length-1])) { // Try to pick the top-most item
						this._map.broadcastEvent('itemPickedUp', { picker: this._player, item: items[items.length-1] });
						Game.addMessage(this._player.getName() + " picks up " + items[items.length-1].describeA());
						this._map.getTile(this._player.getX(), this._player.getY()).removeItem(items[items.length-1]);
					}
				}
			}
			else if(eventData.keyCode == ROT.VK_A) {
				var item = this._player.dropItem('left');
				if(item != null) {
					Game.addMessage(this._player.getName() + " drops " + item.describeA());
					this._map.getTile(this._player.getX(), this._player.getY()).addItem(item);
				}
			}
			else if(eventData.keyCode == ROT.VK_S) {
				var item = this._player.dropItem('right');
				if(item != null) {
					Game.addMessage(this._player.getName() + " drops " + item.describeA());
					this._map.getTile(this._player.getX(), this._player.getY()).addItem(item);
				}
			}
			
			if(endTurn) this._map.endPlayerTurn();
		}
	},
	
	setSubscreen: function(screen) {
		this._subscreen = screen;
	},
	
	render: function(display) {
		if(this._subscreen) {
			this._subscreen.render(display);
		}
		else {
			this._renderWorld(display);
			this._renderUI(display);
		}
	},
	
	_renderWorld: function(display) {
		var sw = Game.getScreenWidth()-40; // Reserve an area 40 characters wide for UI
		var sh = Game.getScreenHeight()-2; // Reserve 1 pixel from top and bottom for border
		var topLeftX = this._player.getX() - (sw / 2);
		topLeftX = Math.min(Math.max(0, topLeftX), this._map.getWidth() - sw);
		var topLeftY = this._player.getY() - (sh / 2);
		topLeftY = Math.min(Math.max(0, topLeftY), this._map.getHeight() - sh);
		
		var visibleCells = this._map.calculateFov(this._player.getX(), this._player.getY(), this._player.getSightRadius());
	
		for(var y = topLeftY; y < topLeftY+sh; y++) {
			for(var x = topLeftX; x < topLeftX+sw; x++) {
				var glyph = this._map.getTile(x, y);
				
				// Check for visibility and draw if visible or visited (visited tiles are greyed)
				if(this._map.isExplored(x, y)) {
					var fg = visibleCells[x + ',' + y] ? glyph.getForeground() : 'darkGrey';
					if(visibleCells[x + ',' + y]) {
						var items = this._map.getTile(x, y).getItems();
						if(items && items.length > 0) {
							glyph = items[items.length-1]; // Get the topmost item
							fg = glyph.getForeground();
						}
					}
					
					display.draw(1+x-topLeftX, 1+y-topLeftY, glyph.getCharacter(), fg, glyph.getBackground());
				}
			}
		}
		
		var entities = this._map.getEntities();
		for(var i = 0; i < entities.length; i++) {
			var e = entities[i];
			if(e.getX() >= topLeftX && e.getX() < topLeftX+sw && e.getY() >= topLeftY && e.getY() < topLeftY+sh) {
				// Check for visibility and draw if visible
				if(visibleCells[e.getX() + ',' + e.getY()]) {
					display.draw(1+e.getX()-topLeftX, 1+e.getY()-topLeftY, e.getCharacter(), e.getForeground(), e.getBackground());
				}
			}
		}
	},
	
	_renderUI: function(display) {
		Game.DrawingUtilities.drawBorders(0, 0, Game.getScreenWidth()-1, Game.getScreenHeight()-1, '+', display);
		
		var uiTextX = Game.getScreenWidth()-38;
		// Message box
		Game.DrawingUtilities.drawBorders(uiTextX-1, 0, Game.getScreenWidth()-1, 9, '+', display);
		var m = Game.getLatestMessages(8);
		var y = 1;
		if(m.length > 0) {
			for(var i = m.length-1; i >=0; i--) {
				y += display.drawText(uiTextX, y, m[i]);
				if(y > 8) break;
			}
		}
		
		// Info box
		Game.DrawingUtilities.drawBorders(uiTextX-1, 9, Game.getScreenWidth()-1, Game.getScreenHeight()-1, '+', display);
		display.drawText(uiTextX, 10, this._player.getName() + '(' + this._player.getGender() + ')');
		var lItem = this._player.getItemInHand('left');
		var rItem = this._player.getItemInHand('right');
		if(!lItem) lItem = 'empty'; else lItem = lItem.describeA();
		if(!rItem) rItem = 'empty'; else rItem = rItem.describeA();
		display.drawText(uiTextX, 11, "Left hand: " + lItem);
		display.drawText(uiTextX, 12, "Right hand: " + rItem);
		display.drawText(uiTextX, 13, "Money: $" + this._player.getMoney());
		display.drawText(uiTextX, 14, "Need to pee: " + this._player.needToPee());
		display.drawText(uiTextX, 15, "The party is " + this._player.funStatus());
		
		var tile = this._map.getTile(this._player.getX(), this._player.getY());
		display.drawText(uiTextX, 17, "Standing on " + tile.describeA());
		if(tile.getItems().length > 0) {
			display.drawText(uiTextX, 18, "Items:");
			y = 19;
			for(var i = 0; i < tile.getItems().length; i++) {
				y += display.drawText(uiTextX, y, ' - ' + tile.getItems()[i].describeA());
			}
		}
	}
};
