Game.Components = {};

Game.Components.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(properties) {
		this._sightRadius = properties['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
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
	act: function() {
		var dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
		dirs = dirs.randomize();
		this.tryMove(this.getX()+dirs[0].x, this.getY()+dirs[0].y);
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
	getPossessive: function() {
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