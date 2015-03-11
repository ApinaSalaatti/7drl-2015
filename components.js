Game.Components = {};

Game.Components.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(properties) {
		this._sightRadius = properties['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	},
	setSightRadius: function(rad) {
		this._sightRadius = rad;
	},
	canSee: function(entity) {
		// If not within a square fow, we can't see them (doing this to avoid possibly expensive calculations)
		if((entity.getX() - this.getX()) * (entity.getX() - this.getX()) + (entity.getY() - this.getY()) * (entity.getY() - this.getY()) > this.getSightRadius() * this.getSightRadius()) {
			return false;
		}
		
		// Calculate the visibility from where we're standing, and if we see the square of the entity, we can see the entity!
		var eX = entity.getX();
		var eY = entity.getY();
		var seen = false;
		this.getMap().getFov().compute(
			this.getX(), this.getY(), this.getSightRadius(),
			function(x, y, radius, visibility) {
				if(x == eX && y == eY) {
					seen = true;
				}
			}
		);
		return seen;
	}
}

Game.Components.Hands = {
	name: 'Hands',
	init: function(properties) {
		this._itemOnLeftHand = null;
		this._itemOnRightHand = null;
	},
	getItemInHand: function(hand) {
		if(hand == 'left') {
			return this._itemOnLeftHand;
		}
		else {
			return this._itemOnRightHand;
		}
	},
	useItem: function(hand) {
		var item = null;
		if(hand == 'left') {
			item = this._itemOnLeftHand;
		}
		else {
			item = this._itemOnRightHand;
		}
		if(item && item.hasComponent('Usable')) {
			item.use(this);
		}
	},
	pickItem: function(item) {
		if(this._itemOnRightHand == null) {
			this._itemOnRightHand = item;
			return true;
		}
		else if(this._itemOnLeftHand == null) {
			this._itemOnLeftHand = item;
			return true;
		}
		
		return false;
	},
	removeItemFromHand: function(item) {
		if(this._itemOnLeftHand == item)
			this._itemOnLeftHand = null;
		else if(this._itemOnRightHand == item)
			this._itemOnRightHand = null;
	},
	dropItem: function(hand) {
		if(hand == 'left') {
			var i = this._itemOnLeftHand;
			this._itemOnLeftHand = null;
			return i;
		}
		else {
			var i = this._itemOnRightHand;
			this._itemOnRightHand = null;
			return i;
		}
	}
}

Game.Components.Attacker = {
	name: 'Attacker',
	init: function(properties) {
		this._hitChance = properties['hitChance'] || 0.5;
		this._attackMessage = properties['attackMessage'] || 'attacks';
		this._attackPower = properties['attackPower'] || 1;
		this._aggressive = properties['aggressive'] != 'undefined' ? properties['aggressive'] : false;
	},
	attack: function(target) {
		var m = this.getName() + " " + this._attackMessage + " " + target.getName();
		var it = null;
		if(this.getItemInHand('right') && this.getItemInHand('right').hasComponent('Weapon'))
			it = this.getItemInHand('right');
		else if(this.getItemInHand('left') && this.getItemInHand('left').hasComponent('Weapon'))
			it = this.getItemInHand('left');
		
		if(it) m += " with " + it.describeA();
		
		if(ROT.RNG.getUniform() < this._hitChance) {
			Game.addMessage(m);
			this.raiseEvent('onAttack', { target: target });
			var bonus = 0;
			if(it) {
				bonus = it.getAttackPower();
				if(it.breaksOnAttack()) {
					Game.addMessage(it.describeThe(true) + " " + it.getBreakingMessage());
					this.removeItemFromHand(it);
				}
			}
			var p = 2 + Math.floor(this._attackPower * ROT.RNG.getUniform()) + bonus;
			target.raiseEvent('onHit', { attacker: this, power: p });
		}
		else {
			Game.addMessage(m + " and misses");
		}
	},
	isAggressive: function() {
		return this._aggressive;
	},
	setAggressive: function(a) {
		this._aggressive = a;
	}
}

Game.Components.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	init: function(properties) {
	
	},
	act: function() {
		this.raiseEvent('onAct');
		this.getMap().startPlayerTurn();
	},
	eventListeners: {
		onDeath: function() {
			this._dead = true;
			Game.addMessage("YOU ARE DEAD! Press enter to continue");
		},
		onJumpOnTable: function() {
			Game.addMessage(this.getName() + ' jumps on a table. WHOO!');
		},
		onJumpOffTable: function() {
			Game.addMessage(this.getName() + " jumps off a table. Party's over.");
		}
	}
}

Game.Components.DrunkActor = {
	name: 'DrunkActor',
	groupName: 'Actor',
	init: function(properties) {
		
	},
	setOwnedDrink: function(d) {
		this._ownedDrink = d;
	},
	moveRandomly: function() {
		var dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
		dirs = dirs.randomize();
		if(this.getMap().getTile(this.getX()+dirs[0].x, this.getY()+dirs[0].y).getHeight() == 0) // Nice drunks don't jump on tables!
			this.tryMove(this.getX()+dirs[0].x, this.getY()+dirs[0].y);
	},
	act: function() {
		if(!this._chasedEntity) {
			this.moveRandomly();
		}
		else {
			if(this._chasedEntity.isDead()) {
				this._chasedEntity = null;
				this.setAggressive(false);
			}
			var offsetX = Math.abs(this._chasedEntity.getX() - this.getX());
			var offsetY = Math.abs(this._chasedEntity.getY() - this.getY());
			if(offsetX <= 1 && offsetY <= 1) {
				// Next to the enemy! ATTACK!
				this.attack(this._chasedEntity);
				return;
			}
			
			// CHASE THAT FUCKER
			var me = this;
			var chased = this._chasedEntity;
			var map = this.getMap();
			var path = new ROT.Path.AStar(chased.getX(), chased.getY(),
				function(x, y) {
					var e = map.getEntityAt(x, y);
					if(e && e != chased && e != me) return false; // If there's an entity at the coordinates, it is blocked
					else return map.getTile(x, y).isWalkable();
				},
				{ topology: 8}
			);
			
			// Now calculate the points on the path. The SECOND is the square we want to move to (the first is our current position)
			var count = 0;
			path.compute(me.getX(), me.getY(), function(x, y) {
				if(count == 1) {
					if(ROT.RNG.getUniform() > 0.5)
						me.tryMove(x, y);
					else
						me.moveRandomly();
				}
				count++;
			});
		}
	},
	eventListeners: {
		itemPickedUp: function(data) {
			if(!this._ownedDrink)
				return;
				
			var i = data.item;
			if(i == this._ownedDrink && this.canSee(data.picker)) {
				this.setAggressive(true);
				this._chasedEntity = data.picker;
				Game.addMessage("A drunk looks angry");
			}
		},
		somethingPeedOn: function(data) {
			var p = data.peeingPerson;
			if(this.canSee(p)) {
				Game.addMessage("Someone saw " + p.getName() + " peeing");
				// Inform all the entitites this drunk can see
				var me = this;
				var eX = p.getX();
				var eY = p.getY();
				this.getMap().getFov().compute(
					this.getX(), this.getY(), this.getSightRadius(),
					function(x, y, radius, visibility) {
						var ent = me.getMap().getEntityAt(x, y);
						if(ent) ent.raiseEvent('peeingPersonFound', { peeingPerson: p });
					}
				);
			}
		},
		onTaunt: function(data) {
			this.setAggressive(true);
			this._chasedEntity = data.taunter;
			Game.addMessage("A drunk looks angry");
		},
		onDeath: function() {
			this.getMap().removeEntity(this);
		}
	}
}

Game.Components.GuardActor = {
	name: 'GuardActor',
	groupName: 'Actor',
	init: function(properties) {
		this._state = 'guard';
	},
	act: function() {
		if(this._state == 'chase') {
			this.updateChase();
		}
		else if(this._state == 'guard') {
			this.updateGuard();
		}
	},
	updateChase: function() {
		if(this._dontGiveUp) {
			if(this.canSee(this._chasedEntity))
				this._dontGiveUp = false; // When we first see the person we search for, being "normal" chase
		}
		else if(!this._chasedEntity || !this.canSee(this._chasedEntity) || this._chasedEntity.isDead()) {
			this.setAggressive(false);
			if(!this._chasedEntity.isDead()) Game.addMessage("A guard gives up the chase");
			this.changeState('guard');
			return;
		}
		
		var offsetX = Math.abs(this._chasedEntity.getX() - this.getX());
		var offsetY = Math.abs(this._chasedEntity.getY() - this.getY());
		if(offsetX <= 1 && offsetY <= 1) {
			// Next to the enemy! ATTACK!
			this.attack(this._chasedEntity);
			return;
		}
		
		var me = this;
		var chased = this._chasedEntity;
		var map = this.getMap();
		var path = new ROT.Path.AStar(chased.getX(), chased.getY(),
			function(x, y) {
				var e = map.getEntityAt(x, y);
				if(e && e != chased && e != me) return false; // If there's an entity at the coordinates, it is blocked
				else return map.getTile(x, y).isWalkable();
			},
			{ topology: 8}
		);
		
		// Now calculate the points on the path. The SECOND is the square we want to move to (the first is our current position)
		var count = 0;
		path.compute(me.getX(), me.getY(), function(x, y) {
			if(count == 1) {
				me.tryMove(x, y);
			}
			count++;
		});
	},
	updateGuard: function() {
		if(!this._originalSpot)
			return;
		if(this.getX() == this._originalSpot.x && this.getY() == this._originalSpot.y)
			return;
		
		var me = this;
		var target = this._originalSpot;
		var map = this.getMap();
		var path = new ROT.Path.AStar(target.x, target.y,
			function(x, y) {
				var e = map.getEntityAt(x, y);
				if(e && e != me) return false; // If there's an entity at the coordinates, it is blocked
				else return map.getTile(x, y).isWalkable();
			},
			{ topology: 8}
		);
		
		// Now calculate the points on the path. The SECOND is the square we want to move to (the first is our current position)
		var count = 0;
		path.compute(me.getX(), me.getY(), function(x, y) {
			if(count == 1) {
				me.tryMove(x, y);
			}
			count++;
		});
	},
	changeState: function(state) {
		if(state == 'guard') {
			
		}
		else if(state == 'chase') {
			if(!this._originalSpot) {
				this._originalSpot = { x: this.getX(), y: this.getY() }; // Save the spot we are standing at so we can return to it after the chase
			}
		}
		else {
			throw new Error("Invalid state given for Guard Actor!");
		}
		this._state = state;
	},
	eventListeners: {
		somethingPeedOn: function(data) {
			var p = data.peeingPerson;
			if(this.canSee(p)) {
				this._chasedEntity = p;
				this.changeState('chase');
				Game.addMessage("A guard looks angry");
				this.setAggressive(true);
			}
		},
		peeingPersonFound: function(data) {
			this._chasedEntity = data.peeingPerson;
			this._dontGiveUp = true;
			this.changeState('chase');
			Game.addMessage("A guard looks angry");
			this.setAggressive(true);
		},
		onDeath: function() {
			this.getMap().removeEntity(this);
		}
	}
}

Game.Components.Health = {
	name: 'Health',
	init: function(properties) {
		this._health = properties['health'] || 10;
	},
	eventListeners: {
		onHit: function(data) {
			var d = data.power;
			this._health -= d;
			Game.addMessage(this.getName() + " takes " + d + " damage");
			if(this._health <= 0) {
				this.raiseEvent('onDeath');
				Game.addMessage(this.getName() + " gets knocked out");
			}
			else if(this._health <= 5 && !this._beatenMessageSent) {
				this._beatenMessageSent = true;
				Game.addMessage(this.getName() + " is really hurt");
				if(this.hasComponent('VitalStats')) this.addStatusMessage('You feel beaten');
			}
			
			// BLOOD SPILLS!!
			var dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}, {x:0, y:0}];
			dirs = dirs.randomize();
			this.getMap().getTile(this.getX()+dirs[0].x, this.getY()+dirs[0].y).setForeground('red');
		}
	}
}

// A catch-all component for the stats that affect lose conditions
Game.Components.VitalStats = {
	name: 'VitalStats',
	init: function(properties) {
		this._maxFun = properties['maxFun'] || 1000;
		this._funLevel = properties['funLevel'] || this._maxFun;
		this._maxDrunk = properties['maxDrunk'] || 500;
		this._drunk = 0;
		
		this._statusMessages = [];
	},
	addStatusMessage: function(m) {
		this._statusMessages.push(m);
	},
	getStatusMessages: function() {
		return this._statusMessages;
	},
	funStatus: function() {
		var percent = this._funLevel / this._maxFun;
		var fun = "";
		if(percent < 0.2)
			fun = "tragic";
		else if(percent < 0.4)
			fun = "lame";
		else if(percent < 0.6)
			fun = "so-so";
		else if(percent < 0.8)
			fun = "awesome";
		else
			fun = "radical";
			
		return fun;
	},
	drunkChange: function(amount) {
		this._drunk += amount;
		if(!this._nauseaMessageSent && this._drunk >= this._maxDrunk-50) {
			Game.addMessage(this.getName() + " feels nauseous");
			this._nauseaMessageSent = true;
			this._statusMessages.push("You don't feel too great");
			this.setSightRadius(5);
		}
	},
	funChange: function(amount) {
		this._funLevel += amount;
	},
	eventListeners: {
		onDrink: function(data) {
			var f = data.funRatio;
			this.funChange(f);
			this.drunkChange(f);
		},
		onAct: function() {
			this.funChange(-1);
			this.drunkChange(-1);
		},
		onPantsPeed: function() {
			this.funChange(-(this._maxFun / 2));
		},
		onHit: function(data) {
			this.funChange(-(data.power*3));
		}
	}
}

Game.Components.Human = {
	name: 'Human',
	init: function(properties) {
		this._gender = properties['gender'] || 'male';
		
		if(this._gender == 'male') {
			this._possessive = 'his';
		}
		else if(this._gender == 'female') {
			this._possessive = 'her';
		}
		else {
			this._possessive = 'hir';
		}
	},
	getGenderPossessive: function() {
		return this._possessive;
	},
	getGender: function() {
		return this._gender;
	}
}

Game.Components.Peeing = {
	name: 'Peeing',
	init: function(properties) {
		this._maxPee = properties['maxPee'] || 1000;
		this._currentPee = properties['pee'] || this._maxPee / 2;
		this._peeRate = properties['peeRate'] || 5;
	},
	pee: function() {
		if(this._currentPee >= this._peeRate) {
			this._currentPee -= this._peeRate;
			var p = this.getMap().getTile(this.getX(), this.getY()).getPeedOn();
			Game.addMessage(this.getName() + " pees on " + p);
		}
	},
	acquirePee: function(amount) {
		this._currentPee += amount;
		if(this._currentPee >= this._maxPee) {
			this._currentPee = this._maxPee / 2;
			Game.addMessage(this.getName() + " pees into " + this.getGenderPossessive() + " pants! How embarrassing!");
			this.raiseEvent('onPantsPeed');
		}
	},
	needToPee: function() {
		var percent = this._currentPee / this._maxPee;
		var need = "";
		if(percent < 0.2)
			need = "no need";
		else if(percent < 0.4)
			need = "slight discomfort";
		else if(percent < 0.6)
			need = "gotta go";
		else if(percent < 0.8)
			need = "legs crossed";
		else
			need = "ready to explode";
			
			return need;
	},
	eventListeners: {
		onAct: function() {
			this.acquirePee(1);
		},
		onDrink: function(data) {
			this.acquirePee(data.peeRatio);
		}
	}
}

Game.Components.Wallet = {
	name: 'Wallet',
	groupName: 'Wallet',
	init: function(properties) {
		this._money = properties['money'] || 50;
	},
	getMoney: function() {
		return this._money;
	},
	addMoney: function(amount) {
		this._money += amount;
	},
	useMoney: function(amount) {
		if(this._money >= amount) {
			this._money -= amount;
			return true;
		}
		else {
			return false;
		}
	}
}

// !!!!!!!!!!!!
// INTERACTIONS
// !!!!!!!!!!!!
Game.Components.BartenderInteractable = {
	name: 'BartenderInteractable',
	groupName: 'Interactable',
	init: function(properties) {
		this._interactionImage = properties['interactionImage'] || Game.ImageUtilities.getRandomImage();
		this._interactionMessage = properties['interactionMessage'] || "What'll it be, fella?";
	},
	interact: function(interacter) {
		Game.Screens.dialogScreen.setup({
			image: this._interactionImage,
			message: this._interactionMessage,
			selections: [
				{ title: "Gimme a beer (4$)", select:
					function() { 
						if(interacter.useMoney(4)) {
							Game.Screens.dialogScreen._message = "Alright, anything else?";
							var item = Game.ItemFactory.create('beer');
							Game.addMessage(interacter.getName() + " buys a beer");
							if(!interacter.pickItem(item)) interacter.getMap().getTile(interacter.getX(), interacter.getY()).addItem(item);
						}
						else {
							Game.Screens.dialogScreen._message = "You can't afford that, buddy.";
						}
					} 
				},
				{ title: "Uhhh nothing thanks", select: function() { Game.Screens.playScreen.setSubscreen(null); } }
			]
		});
		Game.Screens.playScreen.setSubscreen(Game.Screens.dialogScreen);
	}
}

Game.Components.DrunkInteractable = {
	name: 'BartenderInteractable',
	groupName: 'Interactable',
	init: function(properties) {
		this._interactionImage = properties['interactionImage'] || Game.ImageUtilities.getRandomImage();
		this._interactionMessage = properties['interactionMessage'] || Game.TextUtilities.getRandomTaunt();
		this._interactedCount = 0;
	},
	interact: function(interacter) {
		this._interactedCount++;
		if(this._interactedCount >= 3) {
			this._interactionMessage = "Alright that doesh it buddee. Let's dance!";
		}
		else {
			this._interactionMessage = Game.TextUtilities.getRandomTaunt();
		}
		var me = this;
		Game.Screens.dialogScreen.setup({
			image: this._interactionImage,
			message: this._interactionMessage,
			selections: [
				{ title: "Watch where you're going, dickweed!", select:
					function() { 
						me.raiseEvent('onTaunt', { taunter: interacter });
						Game.Screens.playScreen.setSubscreen(null);
					} 
				},
				{ title: "Ummm sorry pal, I'll just be on my way.", select:
					function() {
						if(me._interactedCount >= 3) me.raiseEvent('onTaunt', { taunter: interacter });
						Game.Screens.playScreen.setSubscreen(null);
					} 
				}
			]
		});
		Game.Screens.playScreen.setSubscreen(Game.Screens.dialogScreen);
	}
}

/*
 * Components for items
 */
Game.Components.Drinkable = {
	name: 'Drinkable',
	groupName: 'Usable',
	init: function(properties) {
		this._funRatio = properties['funRatio'] || 1;
		this._peeRatio = properties['peeRatio'] || 1;
		this._maxPortions = properties['maxPortions'] || 1;
		this._portions = properties['portions'] || this._maxPortions;
	},
	getUsingMessage: function() {
		var m = "drinks from " + this.describeA();
		if(this.hasPeeOnIt()) m += " and it tastes horrible";
		return m;
	},
	use: function(user) {
		if(this._portions > 0) {
			this._portions--;
			var fr = this.hasPeeOnIt() ? -100 : this._funRatio;
			user.raiseEvent('onDrink', { funRatio: fr, peeRatio: this._peeRatio });
			if(this._portions == 0) {
				this.getCleaned();
			}
		}
	},
	getForeground: function() {
		if(this._portions == 0) {
			return 'white';
		}
		else {
			return Game.GameObject.prototype.getForeground.call(this);
		}
	},
	getPeedOn: function() {
		Game.GameObject.prototype.getPeedOn.call(this);
		this._portions++;
		if(this._portions > this._maxPortions) {
			this._portions = this._maxPortions;
			return false;
		}
		return true;
	},
	describe: function() {
		var r = ""
		if(this._portions == 0) {
			r = "empty ";
		}
		else if(this._portions < this._maxPortions) {
			r = "partly drunk ";
		}
		
		if(this.hasPeeOnIt()) {
			r += "yellow ";
		}
		
		return r + Game.GameObject.prototype.describe.call(this)
	}
}

Game.Components.Weapon = {
	name: 'Weapon',
	init: function(properties) {
		this._attackPower = properties['attackPower'] || 1;
		this._breaksOnAttack = (properties['breaksOnAttack'] != undefined) ? properties['breaksOnAttack'] : true;
	},
	getAttackPower: function() {
		return this._attackPower;
	},
	breaksOnAttack: function() {
		return this._breaksOnAttack;
	}
}

Game.Components.Breakable = {
	name: 'Breakable',
	init: function(properties) {
		this._breakingMessage = properties['breakingMessage'] || 'shatters';
	},
	getBreakingMessage: function() {
		return this._breakingMessage;
	}
}

Game.Components.Container = {
	name: 'Container',
	groupName: 'Usable',
	init: function(properties) {
		this._contents = properties['contents'] || { money: Math.floor(ROT.RNG.getUniform() * 10 ) };
	},
	getUsingMessage: function() {
		var m = "opens " + this.describeThe() + " and takes its contents";
		return m;
	},
	use: function(user) {
		if(this._contents.money) {
			user.addMoney(this._contents.money);
			Game.addMessage(user.getName() + " takes $" + this._contents.money + " from " + this.describeA());
		}
		
		user.removeItemFromHand(this);
	}
}

Game.Components.Peanuts = {
	name: 'Peanuts',
	groupName: 'Usable',
	getUsingMessage: function() {
		return "eats " + this.describeA();
	},
	getPeedOn: function() {
		Game.GameObject.prototype.getPeedOn.call(this);
		this.setName("Pee-nuts");
	},
	describeA: function() {
		return "some " + this.describe();
	},
	use: function(user) {
		if(this.hasPeeOnIt()) {
			user.raiseEvent('onDrink', { funRatio: -10, peeRatio: 0 });
		}
		else {
			user.raiseEvent('onDrink', { funRatio: 1, peeRatio: 0 });
		}
	}
}