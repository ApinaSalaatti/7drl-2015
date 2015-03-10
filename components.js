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

Game.Components.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	init: function(properties) {
	
	},
	act: function() {
		this.raiseEvent('onAct');
		this.getMap().startPlayerTurn();
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
	act: function() {
		if(!this._chasedEntity) {
			var dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
			dirs = dirs.randomize();
			this.tryMove(this.getX()+dirs[0].x, this.getY()+dirs[0].y);
		}
		else {
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
					me.tryMove(x, y);
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
				this._chasedEntity = data.picker;
			}
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
		if(!this._chasedEntity || !this.canSee(this._chasedEntity)) {
			this.changeState('guard');
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
			}
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
		},
		onAct: function() {
			this.funChange(-1);
			this.drunkChange(-1);
		},
		onPantsPeed: function() {
			this.funChange(-(this._maxFun / 2));
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