Game.Item = function(id, properties) {
	Game.GameObject.call(this, id, properties);
	
	
}
Game.Item.extend(Game.GameObject);

Game.ItemFactory = new Game.Factory('items', Game.Item);

Game.ItemFactory.defineTemplate('beer',
	{
		name: 'beer',
		character: 'U',
		foreground: 'gold',
		maxPortions: 5,
		funRatio: 5,
		components: [Game.Components.Drinkable]
	},
	{ isRandomlySpawnable: true }
);

Game.ItemFactory.defineTemplate('strawberry shot',
	{
		name: 'strawberry shot',
		character: 'u',
		foreground: 'red',
		maxPortions: 1,
		funRatio: 25,
		components: [Game.Components.Drinkable]
	},
	{ isRandomlySpawnable: true }
);