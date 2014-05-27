var Emitter = require('emitter')
var Obj = require('obj')

var Model = Obj.clone()
Model.init = function() {
	Emitter(Model)
	this.computed = this.computed || {}
	this.dependents = this.dependents || {}
	this.has_ones = this.has_ones || {}
	this.has_manys = this.has_manys || {}
	this.data = {}
	this.properties = []
	return this
}

module.exports = Model

Model.set = function(data) {
	var self = this
	for (var prop in data) {
		if (self.properties.indexOf(prop) === -1)
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
Model.where = function(prop, fn) {
	var self = this
	self.properties.push(prop)
	var params = get_param_names(fn)
	// Initialize property dependents
	each(params, function(param) {
		if (self.dependents[param]) self.dependents[param].push(prop)
		else self.dependents[param] = [prop]
	})
	self.computed[prop] = {params: params, fn: fn}
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

// Return an array of strings of the names of the variables for the parameters of a function
function get_param_names(fn) {
	var strip_comments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var arg_names = /([^\s,]+)/g;
	var fn_str = fn.toString().replace(strip_comments, '')
	var result = fn_str.slice(fn_str.indexOf('(') + 1, fn_str.indexOf(')')).match(arg_names)
	if(result === null) result = []
	return result
}

// for loops sux
function each(arr, fn) { for(var i = 0; i < arr.length; ++i) fn(arr[i]) }
function map(arr, fn) { var a = []; for(var i = 0; i < arr.length; ++i) a.push(fn(arr[i])); return a }
