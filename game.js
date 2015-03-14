var Game = {
	_display: null,
	_screenWidth: 120,
	_screenHeight: 28,
	_currentScreen: null,
	_messages: [],
	init: function() {
		this._display = new ROT.Display({ width: this._screenWidth, height: this._screenHeight, fg: 'black', bg: 'white' });
		this.createMusic();
		var game = this;
		window.addEventListener('keydown', function(e) {
			if(e.keyCode == 8) e.preventDefault();
			game._sendInputToScreen('keydown', e);
		});
		window.addEventListener('keypress', function(e) {
			game._sendInputToScreen('keypress', e);
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
	
	clearMessages: function() {
		this._messages = [];
	},
	addMessage: function(m) {
		var turn = '[' + Game.turnNumber + '] ';
		this._messages.push(turn + m);
		if(this._messages.length > 50) {
			this._messages.splice(0, 1);
		}
	},
	getLatestMessages: function(amount) {
		if(amount >= this._messages.length) {
			return this._messages;
		}
		var m = [];
		var start = this._messages.length-amount;
		var end = this._messages.length;
		for(var i = start; i < end; i++) {
			m.push(this._messages[i]);
		}
		return m;
	},
	
	refresh: function() {
		this._display.clear();
		this._currentScreen.render(this._display);
	},
	
	_sendInputToScreen: function(eventName, eventData) {
		if(this._currentScreen != null) {
			this._currentScreen.handleInput(eventName, eventData);
		}
	},
	
	createMusic: function() {
		if(!Game.audio) {
			Game.audio = new Audio("hhg.mp3");
			Game.audio.loop = true;
		}
	},
	startMusic: function() {
		Game.audio.play();
	},
	stopMusic: function() {
		if(Game.audio)
			Game.audio.pause();
	}
}

Game.Glyph = function(properties) {
	properties = properties || {};
	this._char = properties['character'] || '?';
	this._foreground = properties['foreground'] || 'white';
	this._background = properties['background'] || 'black';
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

// EVERYTING CAN BE PEED ON
Game.Glyph.prototype.getPeedOn = function() {
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
