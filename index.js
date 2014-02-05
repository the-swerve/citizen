var Emitter = require('emitter')

var model = function(props, deps, computed) {
	this._props = props
	this._deps = deps
	this._computed = computed
	this._data = {}
}

model.prototype.set = function() {
	if (arguments.length === 2) {
		// Set a single property/value
		set(arguments[0], arguments[1], this)
	} else if (arguments.length === 1) {
		// Set an object of properties/values
		var data = arguments[0]
		for (var prop in data) set(prop, data[prop], this)
	}
	return this
}

model.prototype.has = function(prop) {
	return has(prop, this)
}

model.prototype.get = function() {
	// Get all data
	if (arguments.length === 0) {
		var data = []
		for (var i = 0; i < this._props.length; ++i) {
			var prop = this._props[i]
			data.push(get(prop, this))
		}
		return data
	}
	// Get one property
	if (arguments.length === 1) {
		return get(arguments[0], this)
	}
	// Get many properties
	var vals = []
	for (var i = 0; i < arguments.length; ++i)
		vals.push(get(arguments[i], this))
	return vals
}

var builder = function() {

	var construct = function(data) {
		if(data) this.set(data)
	}
	construct._props = []
	construct._deps = {}
	construct._computed = {}

	construct.prototype = new model(construct._props, construct._deps, construct._computed)
	Emitter(construct.prototype)

	construct.prototype.clone = function() {
		return construct(this)
	}

	// Set a property to being computed with a function depending on other properties
	construct.where = function(prop, fn, deps) {
		construct._props.push(prop)
		// Initialize property dependencies
		for (var i = 0; i < deps.length; ++i) {
			var existing = construct._deps[deps[i]]
			if (existing) existing.push(prop)
			else construct._deps[deps[i]] = [prop]
		}
		construct._computed[prop] = {params: deps, fn: fn}
		return construct
	}

	return construct;
}

module.exports = builder

// Functional utils

// Set a property to a value, changing dependent computing properties if necessary
var set = function(prop, val, model) {
	model._props.push(prop)
	model._data[prop] = val
	model.emit('change ' + prop)

	var deps = model._deps[prop]
	if (deps) {
		for (var i = 0; i < deps.length; ++i) {
			var prop = deps[i]
			var comp = model._computed[prop]
			model.emit('change ' + prop)
		}
	}
}

// Get a property, computing it if needed
var get = function(prop, model) {
	var comp = model._computed[prop]
	if (comp) {
		return get_computed(comp, model)
	} else {
		return model._data[prop]
	}
}

// Given an object that represents a computed property by its function and
// param names, compute it
var get_computed = function(comp, model) {
	var args = model.get(comp.params)
	if (!(args instanceof Array)) args = [args]
	return comp.fn.apply(model, args)
}

// Test whether a model has a prop
var has = function(prop, model) {
	return get(prop, model) !== undefined
}
