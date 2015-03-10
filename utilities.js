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
	}
};

Game.NameUtilities = {
	createRandomName: function() {
		return 'Pasi';
	}
}