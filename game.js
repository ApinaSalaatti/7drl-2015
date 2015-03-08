var Game = {
	_display: null,
	_screenWidth: 100,
	_screenHeight: 26,
	_currentScreen: null,
	_messages: [],
	init: function() {
		this._display = new ROT.Display({ width: this._screenWidth, height: this._screenHeight, fg: 'black', bg: 'white' });
		var game = this;
		window.addEventListener('keydown', function(e) {
			game._sendInputToScreen('keydown', e);
		});
	},
	
	getDisplay: function() {
		return this._display;
	},
	getScreenWidth: function() {
		return this._screenWidth;
	},
	getScreenHeight: function() {
		return this._screenHeight;
	},
	
	switchScreen: function(newScreen) {
		if(this._currentScreen !== null) {
			this._currentScreen.exit();
		}
		this._currentScreen = newScreen;
		this._currentScreen.enter();
		this.refresh();
	},
	
	refresh: function() {
		this._display.clear();
		this._currentScreen.render(this._display);
	},
	
	_sendInputToScreen: function(eventName, eventData) {
		if(this._currentScreen != null) {
			this._currentScreen.handleInput(eventName, eventData);
		}
		Game.refresh();
	}
}

Game.Glyph = function(properties) {
	properties = properties || {};
	this._char = properties['character'] || '?';
	this._foreground = properties['foreground'] || 'black';
	this._background = properties['background'] || 'white';
	this._hasPeeOnIt = properties['hasPeeOnIt'] || false;
}

Game.Glyph.prototype.getCharacter = function() {
	return this._char;
}
Game.Glyph.prototype.setCharacter = function(c) {
	this._char = c;
}
Game.Glyph.prototype.getForeground = function() {
	if(this._hasPeeOnIt) {
		return 'yellow';
	}
	return this._foreground;
}
Game.Glyph.prototype.setForeground = function(fg) {
	this._foreground = fg;
}
Game.Glyph.prototype.getBackground = function() {
	return this._background;
}
Game.Glyph.prototype.setBackground = function(bg) {
	this._background = bg;
}

Game.Glyph.prototype.getPeedOn = function() {
	console.log("glyph peed on");
	this._hasPeeOnIt = true;
}
Game.Glyph.prototype.getCleaned = function() {
	this._hasPeeOnIt = false;
}
Game.Glyph.prototype.hasPeeOnIt = function() {
	return this._hasPeeOnIt;
}

window.onload = function() {
	if(ROT.isSupported()) {
		Game.init();
		document.body.appendChild(Game.getDisplay().getContainer());
		Game.switchScreen(Game.Screens.startScreen);
	}
	else {
		alert('Your browser does not support Roguelike Toolkit. Please consider uprgrading. :(');
	}
};
