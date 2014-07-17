var Emitter = require('emitter-component')
var Obj = require('obj-clone')

var Model = Obj.clone()
Model.init = function(data) {
	Emitter(Model)
	this.computed = this.computed || {}
	this.dependents = this.dependents || {}
	this.has_ones = this.has_ones || {}
	this.has_manys = this.has_manys || {}
	this.data = {}
	this.properties = []
	if(data)
		this.set(data)
	return this
}

module.exports = Model

Model.set = function(x, y) {
	var self = this
	var data = {}
	if (typeof x === 'string')
		data[x] = y
	else if (typeof x === 'object')
		data = x
	for (var prop in data) {
		if (arr_has(self.properties, prop))
			self.properties.push(prop)
		if (self.has_ones[prop])
			self.data[prop] = self.has_ones[prop].clone().set(data[prop])
		else if (self.has_manys[prop])
			self.data[prop] = map(data[prop], function(obj) {
				return self.has_manys[prop].clone().set(obj)
			})
		else
			self.data[prop] = data[prop]
		self.emit('change')
		self.emit('change ' + prop)
		// Fire change events for each dependent computed prop
		if (self.dependents[prop])
			each(self.dependents[prop], function(computed_prop) {
				self.emit('change')
				self.emit('change ' + computed_prop)
			})
	}
	return self
}

// Get a property, computing it if needed
Model.get = function(prop) {
	var self = this
	var comp = self.computed[prop]
	if (!comp) return self.data[prop]
	var args = map(comp.params, function(param) {return self.get(param)})
	return comp.fn.apply(self, args)
}

// Set a property to being computed with a function depending on other properties
Model.where = function(prop, dependents, fn) {
	var self = this
	self.properties.push(prop)
	// Initialize property dependents
	each(dependents, function(dependent) {
		if (self.dependents[dependent])
			self.dependents[dependent].push(prop)
		else self.dependents[dependent] = [prop]
	})
	self.computed[prop] = {params: dependents, fn: fn}
	return self
}

Model.has_one = function(prop_name, NestedModel) {
	this.has_ones[prop_name] = NestedModel
	return this
}

Model.has_many = function(prop_name, NestedModel) {
	this.has_manys[prop_name] = NestedModel
	return this
}

// Utils

// for loops sux
function each(arr, fn) { for(var i = 0; i < arr.length; ++i) fn(arr[i]) }
function map(arr, fn) { var a = []; for(var i = 0; i < arr.length; ++i) a.push(fn(arr[i])); return a }

function arr_has(arr, elem) {
	for (var i = 0; i < arr.length; ++i) if(arr[i] === elem) return true
	return false
}
