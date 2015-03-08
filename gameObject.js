Game.GameObject = function(id, properties) {
	this._id = id;
	properties = properties || {};
	Game.Glyph.call(this, properties);
	
	this._name = properties['name'] || 'AnonymousObject';
	this._attachedComponents = {};
	this._attachedComponentGroups = {};
	
	var c = properties['components'] || [];
	for(var i = 0; i < c.length; i++) {
		for(var key in c[i]) {
			if(key != 'init' && key != 'name' && key != 'groupName' && !this.hasOwnProperty(key)) {
				this[key] = c[i][key];
			}
		}
		this._attachedComponents[c[i].name] = true;
		// If the component is part of a group (i.e. offers a certain 'interface'), add that info too
		if(c[i].groupName) {
			this._attachedComponentGroups[c[i].groupName] = true;
		}
	}
	// Init the components (do it in a separate loop so if components refer to each other, their order won't matter)
	for(var i = 0; i < c.length; i++) {
		if(c[i].init) {
			c[i].init.call(this, properties);
		}
	}
}
Game.GameObject.extend(Game.Glyph);

Game.GameObject.prototype.hasComponent = function(component) {
	if(typeof component === 'object') {
		return this._attachedComponents[component.name];
	}
	else {
		return this._attachedComponents[component] || this._attachedComponentGroups[component];
	}
}

Game.GameObject.prototype.getID = function() {
	return this._id;
}

Game.GameObject.prototype.getName = function() {
	return this._name;
}
Game.GameObject.prototype.setName = function(n) {
	this._name = n;
}
