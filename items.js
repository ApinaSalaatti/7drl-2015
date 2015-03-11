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
		attackPower: 4,
		components: [Game.Components.Drinkable, Game.Components.Breakable, Game.Components.Weapon]
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
		components: [Game.Components.Drinkable, Game.Components.Breakable, Game.Components.Weapon]
	},
	{ isRandomlySpawnable: true }
);

Game.ItemFactory.defineTemplate('bag',
	{
		name: 'bag',
		character: 'b',
		foreground: 'purple',
		breaksOnAttack: false,
		attackPower: 2,
		components: [Game.Components.Weapon, Game.Components.Container]
	},
	{ isRandomlySpawnable: true }
);

Game.ItemFactory.defineTemplate('peanuts',
	{
		name: 'peanuts',
		character: '%',
		foreground: 'brown',
		breaksOnAttack: false,
		attackPower: 2,
		components: [Game.Components.Peanuts]
	},
	{ isRandomlySpawnable: true }
);