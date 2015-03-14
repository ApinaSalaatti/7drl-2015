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
		
		// STOP AUDIO
		Game.stopMusic();
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
		Game.DrawingUtilities.drawLogo(1, 1, display);
		
		display.drawText(1, 7, "Type in your name: ");
		for(var i = 0; i < this._selections.length; i++) {
			var bg = '';
			if(this._currentSelection == i) bg = 'lightGrey';
			display.drawText(1, 8+i, '%b{'+bg+'}' + this._selections[i].title);
		}
		
		// Render player info
		display.drawText(20, 7, Game.playerName);
		display.drawText(20, 8, Game.playerGender);
		
		// Render instructions
		var y = 7;
		y += display.drawText(55, y, "HOW TO PLAY:");
		y += display.drawText(55, y, "Move with ARROWS or YUHJKLBN");
		y += display.drawText(55, y, "- (Y, U, B and N move you diagonally)");
		y += display.drawText(55, y, "P picks up an item from the square you are on");
		y += display.drawText(55, y, "Z and X use items in left and right hand");
		y += display.drawText(55, y, "A and S drop items from left and right hand");
		y += display.drawText(55, y, "SPACE makes you pee! You can pee everywhere!");
		y += display.drawText(55, y, "I to show this info");
		y += 1;
		y += display.drawText(55, y, "- You can interact with people in the world by walking into them (you can also fight angry people the same way)");
		y += display.drawText(55, y, "- The aim of the game is to find the toilet (a tile that's just a capital T)");
		y += display.drawText(55, y, "- You really need to go, so you might have to relieve yourself before you find a toilet. Don't let anyone see you pee, though! If you pee your pants your fun level will drop very low.");
		y += display.drawText(55, y, "- You must not let your fun drop too low or you lose! Drink beer and eat peanuts to keep having a good time. You also lose if you get beaten up for whatever reason.");
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
		
		var populator = new MapPopulator();
		populator.populate(this._map, this._player);
		
		Game.turnNumber = 0;
		this._map.getEngine().start();
		
		Game.clearMessages();
		Game.addMessage("You really, really gotta go");
		
		Game.startMusic();
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(this._subscreen) {
			this._subscreen.handleInput(eventName, eventData);
			Game.refresh();
			return;
		}
		
		if(this._player.isDead()) {
			//if(eventData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screens.loseScreen);
			//}
			return;
		}
		
		if(eventName == 'keydown') {
			var endTurn = true;
			if(eventData.keyCode == ROT.VK_UP || eventData.keyCode == ROT.VK_J) {
				this._player.tryMove(this._player.getX(), this._player.getY()-1);
			}
			else if(eventData.keyCode == ROT.VK_DOWN || eventData.keyCode == ROT.VK_K) {
				this._player.tryMove(this._player.getX(), this._player.getY()+1);
			}
			else if(eventData.keyCode == ROT.VK_LEFT || eventData.keyCode == ROT.VK_H) {
				this._player.tryMove(this._player.getX()-1, this._player.getY());
			}
			else if(eventData.keyCode == ROT.VK_RIGHT || eventData.keyCode == ROT.VK_L) {
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
			else if(eventData.keyCode == ROT.VK_F1 || eventData.keyCode == ROT.VK_I) {
				Game.Screens.playScreen.setSubscreen(Game.Screens.infoScreen);
				endTurn = false;
			}
			else {
				endTurn = false;
			}
			
			if(endTurn) this._map.endPlayerTurn();
		}
	},
	
	setSubscreen: function(screen) {
		if(this._subscreen != null) this._subscreen.exit();
		this._subscreen = screen;
		if(screen != null) screen.enter();
	},
	
	render: function(display) {
		if(this._subscreen) {
			this._subscreen.render(display);
		}
		else {
			var r = Math.floor((0.5 + Math.sin(Game.turnNumber / 2) / 2) * 255);
			var g = 255 - Math.floor((0.5 + Math.sin(Game.turnNumber / 2) / 2) * 255);
			var b = 50;
			display.setOptions({bg: ROT.Color.toRGB([r,g,b])});
			document.body.style.background = ROT.Color.toRGB([r,g,b]);
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
		
		// GET DISCO LIGHTING!!
		var d = this._map.getDiscoBalls();
		var lights = [];
		if(!this._lightState)
			this._lightState = 1;
		else
			this._lightState = 0;
			
		for(var i = 0; i < d.length; i++) {
			var l = this._getLightLines(d[i].x, d[i].y);
			for(var j = 0; j < l.length; j++) {
				this._map.getTile(l[j].x, l[j].y).isInDiscoLight = true;
			}
		}
		
		// LETS RENDER
		for(var y = topLeftY; y < topLeftY+sh; y++) {
			for(var x = topLeftX; x < topLeftX+sw; x++) {
				var t = this._map.getTile(x, y);
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
					var bg = display._options.bg;
					if(glyph.getBackground() != 'black') bg = glyph.getBackground();
					
					// Being in disco light just adds to some colors, I dunno
					if(t.isInDiscoLight) {
						var f = ROT.Color.fromString(fg);
						var b = ROT.Color.fromString(bg);
						f[0] += 100;
						f[1] += 30;
						b[0] += 100;
						b[1] += 30;
						
						fg = ROT.Color.toRGB(f);
						bg = ROT.Color.toRGB(b);
					}
					display.draw(1+x-topLeftX, 1+y-topLeftY, glyph.getCharacter(), fg, bg);
				}
			}
		}
		
		var entities = this._map.getEntities();
		for(var i = 0; i < entities.length; i++) {
			var e = entities[i];
			if(e.getX() >= topLeftX && e.getX() < topLeftX+sw && e.getY() >= topLeftY && e.getY() < topLeftY+sh) {
				// Check for visibility and draw if visible
				if(visibleCells[e.getX() + ',' + e.getY()]) {
					var bg = display._options.bg;
					var fg = e.getForeground();
					if(e.getBackground() != 'black') bg = e.getBackground();
					
					var t = this._map.getTile(e.getX(), e.getY());
					// Being in disco light just adds to some colors, I dunno
					if(t.isInDiscoLight) {
						var f = ROT.Color.fromString(fg);
						var b = ROT.Color.fromString(bg);
						f[0] += 100;
						f[1] += 30;
						b[0] += 100;
						b[1] += 30;
						
						fg = ROT.Color.toRGB(f);
						bg = ROT.Color.toRGB(b);
					}
					
					display.draw(1+e.getX()-topLeftX, 1+e.getY()-topLeftY, e.getCharacter(), fg, bg);
				}
			}
		}
		
		// Cancel this frame's disco lights
		for(var i = 0; i < d.length; i++) {
			var l = this._getLightLines(d[i].x, d[i].y);
			for(var j = 0; j < l.length; j++) {
				this._map.getTile(l[j].x, l[j].y).isInDiscoLight = false;
			}
		}
	},
	
	_getLightLines: function(fromX, fromY) {
		// Render all lines for maximum of 20 x and/or 15 y
		var r = [];
		if(!this._lightState) {
			var tiles = this._getLightLine(fromX, fromY, fromX+20, fromY+15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX+20, fromY-15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX-20, fromY+15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX-20, fromY-15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
		}
		else {
			tiles = this._getLightLine(fromX, fromY, fromX-20, fromY);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX+20, fromY);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX, fromY-15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
			
			tiles = this._getLightLine(fromX, fromY, fromX, fromY+15);
			for(var i = 0; i < tiles.length; i++) {
				r.push(tiles[i]);
			}
		}
		
		return r;
	},
	
	_getLightLine: function(x0, y0, x1, y1) {
		var r = [];
		// Render a line of light from given position to given position or until a wall is hit
		// Using the Bresenham line algorithm
		var dx = x0 - x1;
		var dy = y0 - y1;
		if(dx == 0) {
			var x = x0;
			var yChange = dy < 0 ? 1 : -1;
			for(var y = y0; y != y1; y += yChange) {
				var t = this._map.getTile(x, y);
				if(t.getName() == 'wall')
					return r;
				if(t != Game.Tiles.nullTile)
					r.push({x:x, y:y});
			}
		}
		else {
			var error = 0;
			var deltaErr = Math.abs(dy / dx);
			var y = y0;
			var xChange = dx < 0 ? 1 : -1;
			for(x = x0; x != x1; x += xChange) {
				var t = this._map.getTile(x, y);
				if(t.getName() == 'wall')
					return r;
				
				if(t != Game.Tiles.nullTile)
					r.push({x:x, y:y});
				error += deltaErr;
				while(error >= 0.5) {
					if(t.getName() == 'wall')
						return r;
						
					if(t != Game.Tiles.nullTile)
						r.push({x:x, y:y});
					y += dy < 0 ? 1 : -1;
					error -= 1;
				}
			}
		}
		return r;
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
		
		var statuses = this._player.getStatusMessages();
		for(var i = 0; i < statuses.length; i++) {
			display.drawText(uiTextX, 16+i, statuses[i]);
		}
		
		var tile = this._map.getTile(this._player.getX(), this._player.getY());
		display.drawText(uiTextX, 21, "Standing on " + tile.describeA());
		if(tile.getItems().length > 0) {
			display.drawText(uiTextX, 22, "Items:");
			y = 23;
			for(var i = 0; i < tile.getItems().length; i++) {
				y += display.drawText(uiTextX, y, ' - ' + tile.getItems()[i].describeA());
			}
		}
	}
};

Game.Screens.dialogScreen = {
	_selected: 0,
	_selections: null,
	setup: function(properties) {
		this._image = properties['image'] || [];
		this._message = properties['message'] || "Make a selection:";
		this._selections = properties['selections'] || [];
	},
	enter: function() {
	
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_DOWN) {
				this._selected++;
				if(this._selected >= this._selections.length) this._selected = 0;
			}
			else if(eventData.keyCode == ROT.VK_UP) {
				this._selected--;
				if(this._selected < 0) this._selected = this._selections.length-1;
			}
			else if(eventData.keyCode == ROT.VK_RETURN) {
				this._selections[this._selected].select();
			}
		}
	},
	render: function(display) {
		Game.DrawingUtilities.drawImage(0, 0, display, this._image);
		
		display.drawText(4, Game.getScreenHeight() - 15, this._message);
		for(var i = 0; i < this._selections.length; i++) {
			var bg = '';
			if(i == this._selected) bg = '%b{lightGrey}'
			display.drawText(1, Game.getScreenHeight() - 5 + i, bg + this._selections[i].title);
		}
	}
}

Game.Screens.loseScreen = {
	setup: function(message, image) {
		this._message = message || "You lose!";
		this._image = image || Game.ImageUtilities.getStreetImage();
	},
	enter: function() {
	
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screens.startScreen);
			}
		}
	},
	render: function(display) {
		Game.DrawingUtilities.drawImage(0, 0, display, this._image);
		
		var col = '%c{yellow}';
		
		display.drawText(10, 10, col + this._message);
		display.drawText(40, 18, col + "PRESS ENTER TO RESTART");
	}
}

Game.Screens.victoryScreen = {
	enter: function() {
		
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screens.startScreen);
			}
		}
	},
	render: function(display) {
		Game.DrawingUtilities.drawImage(0, 0, display, Game.ImageUtilities.getToiletImage());
		
		var col = '%c{yellow}';
		
		display.drawText(3, 5, col + "Your whole body trembles as you enter the filthy toilet booth");
		display.drawText(1, 8, col + "A smell of something that probably once was digested by someone in this club lingers in the toilet");
		display.drawText(5, 10, col + "For you, though, the smell does not signify sickness or disease");
		display.drawText(7, 11, col + "It signifies your journey is finally");
		display.drawText(16, 13, col + "OVER");
		display.drawText(50, 20, col + "THE END!");
	}
}

Game.Screens.infoScreen = {
	enter: function() {
		
	},
	exit: function() {
	
	},
	handleInput: function(eventName, eventData) {
		if(eventName == 'keydown') {
			if(eventData.keyCode == ROT.VK_F1 || eventData.keyCode == ROT.VK_I || eventData.keyCode == ROT.VK_ESCAPE) {
				Game.Screens.playScreen.setSubscreen(null);
			}
		}
	},
	render: function(display) {
		var y = 7;
		y += display.drawText(55, y, "HOW TO PLAY:");
		y += display.drawText(55, y, "Move with ARROWS or YUHJKLBN");
		y += display.drawText(55, y, "- (Y, U, B and N move you diagonally)");
		y += display.drawText(55, y, "P picks up an item from the square you are on");
		y += display.drawText(55, y, "Z and X use items in left and right hand");
		y += display.drawText(55, y, "A and S drop items from left and right hand");
		y += display.drawText(55, y, "SPACE makes you pee! You can pee everywhere!");
		y += display.drawText(55, y, "I to show this info");
		y += 1;
		y += display.drawText(55, y, "- You can interact with people in the world by walking into them (you can also fight angry people the same way)");
		y += display.drawText(55, y, "- The aim of the game is to find the toilet (a tile that's just a capital T)");
		y += display.drawText(55, y, "- You really need to go, so you might have to relieve yourself before you find a toilet. Don't let anyone see you pee, though! If you pee your pants your fun level will drop very low.");
		y += display.drawText(55, y, "- You must not let your fun drop too low or you lose! Drink beer and eat peanuts to keep having a good time. You also lose if you get beaten up for whatever reason.");
	}
}