var assert = require('assert')
var model = require ('citizen')

describe('citizen', function() {

	it ('instantiates', function() {
		var Post = model()
		var post = new Post()
		assert(post)
	})

	it ('sets and gets data', function() {
		var Post = model()
		var post = new Post({title: 'x'})
		assert(post.get('title') === 'x')
		post.set('title', 'hello')
		assert(post.get('title') === 'hello')
		post.set({title: 'goodbye'})
		assert(post.get('title') === 'goodbye')
	})

	it ('gets an array of data', function() {
		var Post = model()
		var post = new Post({x: 'x', y: 'y'})
		var attrs = post.get()
		assert(attrs[0] === 'x')
		assert(attrs[1] === 'y')
	})

	it ('sets computed properties', function() {
		var Post = model()
			.where('one', function(zero) {
				return zero + 1;
			}, ['zero'])
		
		var post = new Post({zero: 0})
		assert(post.get('zero') === 0)
		assert(post.get('one') === 1)
	})

	it ('tests if has prop', function() {
		var Post = model()
		var post = new Post({'x': 1})
		assert(post.has('x') === true)
		assert(post.has('y') === false)
	})

	it ('emits a change event on setting prop', function() {
		var Post = model()
		var post = new Post()
		var changed = false
		post.on('change prop', function() { changed = true })
		post.set('prop', 'val')
		assert(changed)
	})

	it ('emits a change event for a computed prop when its dependencies change', function () {
		var Post = model()
			.where('computed', function(prop) { return 'computed' }, ['prop'])
		var post = new Post({'prop': 'val'})
		var changed = false
		post.on('change computed', function() { changed = true })
		post.set('prop', 'new val')
		assert(changed)
	})

})
