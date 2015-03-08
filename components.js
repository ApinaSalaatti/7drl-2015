Game.Components = {};

Game.Components.Hands = {
	init: function(properties) {
		this._itemOnLeftHand = null;
		this._itemOnRightHand = null;
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
			
		}
		else {
		
		}
	}
}

Game.Components.Peeing = {
	init: function(properties) {
		this._maxPee = properties['maxPee'] || 1000;
		this._currentPee = properties['pee'] || this._maxPiss / 2;
		this._peeRate = properties['peeRate'] || 1;
	},
	pee: function() {
		this._currentPee -= this._peeRate;
		this.getMap().getTile(this.getX(), this.getY()).getPeedOn();
	},
	acquirePee: function(amount) {
		this._currentPee += amount;
		if(this._currentPee >= this._maxPee) {
			// TODO die here in an explosion of piss
		}
	}
}
