var assert = require('assert')
var Model = require('../')
var Obj = require('obj-clone')

describe('citizen', function() {

	it ('instantiates', function() {
		var Post = Model.clone()
		assert(Post)
	})

	it ('sets and gets data', function() {
		var post = Model.clone().set({title: 'x'})
		assert(post.get('title') === 'x')
		post.set({title: 'goodbye'})
		assert(post.get('title') === 'goodbye')
	})

	it ('sets and gets a single string field', function() {
		var post = Model.clone().set('title', 'x')
		assert(post.get('title') === 'x')
		post.set({title: 'goodbye'})
		assert(post.get('title') === 'goodbye')
	})

	it ('sets multiple models', function() {
		var post0 = Model.clone().set({id: 0})
		var post1 = Model.clone().set({id: 1})
		assert(post0.get('id') === 0 && post1.get('id') === 1)
	})

	it ('gets the whole data object', function() {
		var Post = Model.clone().set({x: 'x', y: 'y'})
		assert(Post.data.x === 'x')
		assert(Post.data.y === 'y')
	})

	it ('sets computed properties', function() {
		var post = Model.clone()
			.where('one', function(zero) {return zero + 1})
			.set({zero: 0})
		assert(post.get('zero') === 0)
		assert(post.get('one') === 1)
	})

	it ('emits a change event on setting prop', function() {
		var Post = Model.clone()
		var changed = false
		Post.on('change prop', function() { changed = true })
		Post.set({prop: 'val'})
		assert(changed)
	})

	it ('emits a change event for a computed prop when its dependencies change', function() {
		var post = Model.clone()
			.where('computed', function(prop) { return 'cc' })
			.set({prop: 'val'})
		var changed = false
		post.on('change computed', function() { changed = true })
		post.set({prop: 'new val'})
		assert(changed)
	})

	it ('instantiates a nested has_one model', function() {
		var Comment = Model.clone()
		var Post = Model.clone()
			.has_one('comment', Comment)
			.set({comment: {x: 'x'}})
		assert(Post.get('comment').get('x') === 'x')
	})

	it ('gets a computed property on a has_one model', function() {
		var Comment = Model.clone()
			.where('computed', function(x) { return x + 1 })
		var post = Model.clone().has_one('comment', Comment)
			.set({comment: {x: 1}})
		assert(post.get('comment').get('computed') === 2)
	})

	it ('instantiates a nested has_many', function() {
		var Comment = Model.clone()
		var Post = Model.clone()
			.has_many('comments', Comment)
			.set({comments: [{x: 1}, {x: 2}]})
		assert(Post.get('comments')[0].get('x') === 1)
		assert(Post.get('comments')[1].get('x') === 2)
	})

	it ('gets computed properties for models within nested has_manys', function() {
		var Comment = Model.clone()
			.where('computed', function(x) { return x + 1})
		var Post = Model.clone().has_many('comments', Comment)
			.set({comments: [{x:1}]})
		assert(Post.get('comments')[0].get('computed') === 2)
	})

})
