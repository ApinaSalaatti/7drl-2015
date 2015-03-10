Game.Factory = function(name, ctor) {
	this._name = name;
	this._ctor = ctor;
	this._templates = {};
	this._randomPool = {};
}
Game.Factory.latestObjectID = 1;

Game.Factory.prototype.defineTemplate = function(name, template, options) {
	this._templates[name] = template;
	
	if(options && options['isRandomlySpawnable']) {
		this._randomPool[name] = template;
	}
}

Game.Factory.prototype.create = function(templateName, additionalProperties) {
	if(!this._templates[templateName]) {
		throw new Error("No template found on " + this._name + " factory: " + templateName);
	}
	
	// Copy the template
	var template = Object.create(this._templates[templateName]);
	
	// Apply extra properties
	if(additionalProperties) {
		for(var key in additionalProperties) {
			template[key] = additionalProperties[key];
		}
	}
	
	return new this._ctor(Game.Factory.latestObjectID++, template);
}

Game.Factory.prototype.createRandom = function() {
	return this.create(Object.keys(this._randomPool).random());
}
