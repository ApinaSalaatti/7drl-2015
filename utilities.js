Game.DrawingUtilities = {
	drawBorders: function(x1, y1, x2, y2, character, display, fg, bg) {
		for(var i = x1; i <= x2; i++) {
			display.draw(i, y1, character, fg, bg);
			display.draw(i, y2, character, fg, bg);
		}
		for(var i = y1; i <= y2; i++) {
			display.draw(x1, i, character, fg, bg);
			display.draw(x2, i, character, fg, bg);
		}
	},
	
	drawImage: function(startX, startY, display, lines) {
		if(lines) {
			var x = startX;
			var y = startY;
			for(var i = 0; i < lines.length; i++) {
				y += display.drawText(x, y, lines[i]);
			}
		}
	},
	
	drawRandomImage: function(startX, startY, display) {
		this.drawImage(startX, startY, display, Game.ImageUtilities.getRandomImage());
	}
};

Game.NameUtilities = {
	createRandomName: function() {
		return 'Pasi';
	}
}

Game.ImageUtilities = {
	nickCage: [
		",,,,,,,,,::::;'+';:+#'+';;;;;;;;;;;;;;;'''+++#@@@###@#####+++++##++",
		",,,,,,,:::::::'+';;###@@#';::;:;;;;;;;'''''+++#@@###@@#+#++++++##++",
		",,,,,,,,,,,:::'+';;#++'+#+;;;;;:;;;;;;;''''+++#@@##@@@##+#+++++++++",
		",,,,,,,,,,,,::'++;;#';;;+++;;;:;;;;;;''''''+++##@@#@@@@###+++++++++",
		",,,,,,,,,:,:::'++;'+;'+''''';;:;;;;;;;'''''+++#@#@@#@@@@##++#++++++",
		",,,,,,,,,,,:::''+'+'+#+++''';;;''+#+'''''''+++##@@@@#@@@##+++++++++",
		",,,,,,,,,,,,,:''''+'+;';''';;''++###@#+'+++++###@@@@@@@@@++++++++++",
		",,,,,,,,,,,,,:'''';'+++';'';;;''++++#@@#+++++##@@@@@@@@@@#+++++++++",
		",,,,,,,,,,::::''';;;''+'''';;''+'++'''+@++++###@@@@@@@@@@##++++++++",
		",,,,,,,,,,,,::''';;;;''''';;'+++++#++''+#+++#@@@@@@@@@@@@##++++++++",
		",,,,,,,,,,,,,:''';;;;;;;;;;;++++';;'#+'+#+++#@@@@@@@@@@@@@+++++++++",
		",,,,,,,,,,::::'';;;;;;;;;;;'++'+'+#'+#++#+++#@@@@@@@@@@@@@#++++++++",
		",,,,,,,,,,,,::'';::;;;;;;;++++'''++'+#++++++#@@@@@@@@@@@@@#+#++++++",
		",,,,,,,,,,,,,:'';;;;;;;;;'+'''''''+++#+++++##@@@@@@@@@@@@@#++++++++",
		",,,,,,,,,,,,,:';;;:;;;;;;+'+'''';''''+++++++#@@@@@@@@@@@@@+++++++++",
		",,,,,,,,,,,,,:'';;''';;;''+++'';;;''''++++++@@@@@@@@@@@@@@+++++++++",
		",,,,,,,,,,,,,:'''++''#''''''++';;;;'''+++++#@@@@@@@@@@@@@@+++++++++",
		",,,,,,,,,,,,,,'''+'''''+##+++#';;;;;'''++++@@@@@@@@@@@@@@@#++++++++",
		",,,,,,,,:,::::'''''''''+###++++;;;;;'+++++#@@@@@@@@@@@@@@+#+++++++#",
		",,,,,,,:::::::''''''';''++++++';;;;'++++++#@@++#+@@@@@@@@##+#++++++"
	],
	getRandomImage: function() {
		return this.nickCage;
	}
}

Game.TextUtilities = {
	_taunts: [
		"Hey-ummm whatcha lookin' at pardner?",
		"Hooooo boy ye shoore are a funny-lookin' fella!",
		"Get yer dirty hand of me ya lil' punk!",
		"Shieeeet you lookin' like a whale in an ink-sac, mate."
	],
	
	getRandomTaunt: function() {
		this._taunts = this._taunts.randomize();
		return this._taunts[0];
	}
}