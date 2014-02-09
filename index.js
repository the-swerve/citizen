var Emitter = require('emitter')

var model = {}

model.set = function() {
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

model.has = function(prop) {
	return has(prop, this)
}

model.get = function() {
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

var collection = function(arr) {
	this.all = arr
	return this
}

collection.prototype.find = function(x, y) {
	var ret = []
	var func, prop, val
	if (typeof x === 'function') {
		func = x
	}
	else {
		prop = x
		val = y
	}

	for (var i = 0; i < this.all.length; ++i) {
		var model = this.all[i]
		if (func && func(model)) ret.push(model)
		else if (prop && model.get(prop) === val) ret.push(model)
	}

	if (ret.length === 1) ret = ret[0]
	return ret
}

var builder = function() {

	var citizen = function(data) {
		this._data = {}
		this._props = citizen.props
		this._deps = citizen.deps
		this._computed = citizen.computed
		this._nested = citizen.nested
		this._collections = citizen.collections
		if(data) this.set(data)
	}

	citizen.props = []
	citizen.deps = {}
	citizen.computed = {}
	citizen.nested = {}
	citizen.collections = {}

	citizen.prototype = model
	Emitter(citizen.prototype)

	// Set a property to being computed with a function depending on other properties
	citizen.where = function(prop, fn, params) {
		citizen.props.push(prop)
		// Initialize property dependencies
		for (var i = 0; i < params.length; ++i) {
			var existing = citizen.deps[params[i]]
			if (existing) existing.push(prop)
			else citizen.deps[params[i]] = [prop]
		}
		citizen.computed[prop] = {params: params, fn: fn}
		return citizen
	}

	citizen.nest = function(prop, Model) {
		citizen.nested[prop] = Model
		return citizen
	}

	citizen.nest.many = function(prop, Model) {
		citizen.collections[prop] = Model
		return citizen
	}

	return citizen
}

module.exports = builder

// Functional utils

// Map over an array of values, instantiating a collection for each element
var create_collection = function(arr, Model) {
	var coll = []
	for (var i = 0; i < arr.length; ++i) {
		coll.push(new Model(arr[i]))
	}
	return new collection(coll)
}

// Set a property to a value, changing dependent computing properties if necessary
var set = function(prop, val, model) {
	if (model._props.indexOf(prop) === -1) model._props.push(prop)

	var Nested = model._nested[prop]
	if (Nested) {
		var nested = new Nested(val)
		model._data[prop] = nested
	} else {
		var Collection = model._collections[prop]
		if(Collection) {
			model._data[prop] = create_collection(val, Collection)
		} else {
			model._data[prop] = val
		}
	}

	model.emit('change')
	model.emit('change ' + prop)

	var deps = model._deps[prop]
	if (deps) {
		for (var i = 0; i < deps.length; ++i) {
			var computed_prop = deps[i]
			var comp = model._computed[computed_prop]
			model.emit('change')
			model.emit('change ' + computed_prop)
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
