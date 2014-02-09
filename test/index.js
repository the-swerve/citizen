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

	it ('sets multiple models', function() {
		var Post = model()
		post0 = new Post({id: 0})
		post1 = new Post({id: 1})
		assert(post0.get('id') !== post1.get('id'))
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

	it ('emits a change event for a computed prop when its dependencies change', function() {
		var Post = model()
			.where('computed', function(prop) { return 'cc' }, ['prop'])
		var post = new Post({'prop': 'val'})
		var changed = false
		post.on('change computed', function() { changed = true })
		post.set('prop', 'new val')
		assert(changed)
	})

	it ('instantiates a model', function() {
		var Comment = model()
		var Post = model().nest('comment', Comment)
		assert(Post)
	})

	it ('sets and gets a nested model', function() {
		var Comment = model()
		var Post = model().nest('comment', Comment)
		var post = new Post({comment: {x: 1}})
		var comment = post.get('comment')
		assert(comment instanceof Comment)
	})

	it ('gets a computed property on a nested model', function() {
		var Comment = model()
			.where('computed', function(x) { return x + 1 }, ['x'])
		var Post = model().nest('comment', Comment)
		var post = new Post({comment: {x: 1}})
		var comment = post.get('comment')
		assert(comment.get('computed') === 2)
	})

	it ('instantiates a collection', function() {
		var Comment = model()
		var Post = model()
		Post.nest.many('comments', Comment)
		assert(Post)
	})

	it ('sets and gets collection', function() {
		var Comment = model()
		var Post = model().nest.many('comments', Comment)
		var post = new Post()
		post.set('comments', [{text:'x'}])
		var comments = post.get('comments')
		assert(comments.all[0] instanceof Comment)
		assert(comments.all[0].get('text') === 'x')
	})

	it ('fires change collection', function() {
		var Comment = model()
		var Post = model().nest.many('comments', Comment)
		var post = new Post()
		var changed = false
		post.on('change comments', function() {changed=true})
		post.set('comments', [])
		assert(changed)
	})

	it ('gets computed properties for models within collections', function() {
		var Comment = model()
			.where('computed', function(x) { return x + 1}, ['x'])
		var Post = model().nest.many('comments', Comment)
		var post = new Post({comments: [{x:1}]})
		var comment = post.get('comments').all[0]
		assert(comment.get('computed') === 2)
	})

	it ('finds a model in a collection by id', function() {
		var Comment = model()
		var Post = model().nest.many('comments', Comment)
		var post = new Post({comments: [{id: 0}, {id: 1}]})
		var comment = post.get('comments').find('id', 1)
		assert(comment.get('id'), 1)
	})

	it ('finds a model in a collection using a function', function() {
		var Comment = model()
		var Post = model().nest.many('comments', Comment)
		var post = new Post({comments: [{id: 0}, {id: 1}]})
		var comment = post.get('comments').find(function(post){ return post.get('id') < 1 })
		assert(comment.get('id') === 0)
	})

	it ('finds a model in a collection by a computed property', function() {
		var Comment = model()
			.where('computed', function(id) { return id + 1}, ['id'])
		var Post = model().nest.many('comments', Comment)
		var post = new Post({comments: [{id:0}, {id: 1}]})
		// Find comment with computed=1, which means id=0
		var comment = post.get('comments').find('computed', 1)
		assert(comment.get('id') === 0)
	})

	it ('creates a nest within a nest', function() {
		var M0 = model()
		var M1 = model().nest('m0', M0)
		var M2 = model().nest('m1', M1)
		// m1 has one m0
		// m2 has one m1
		var m2 = new M2({m1: {m0: {x: 0}}})
		var m0 = m2.get('m1').get('m0')
		assert.strictEqual(m0.get('x'), 0)
	})

	it ('creates a nest within a collection', function() {
		var M0 = model()
		var M1 = model().nest('m0', M0)
		var M2 = model().nest.many('m1s', M1)
		// m1 has one m0
		// m2 has many m1s
		var m2 = new M2({m1s: [{m0: {x: 0}}, {m0: {x: 1}}]})
		var m0 = m2.get('m1s').all[0].get('m0')
		assert.strictEqual(m0.get('x'), 0)
	})

	it ('creates a collection within a nest', function() {
		var M0 = model()
		var M1 = model().nest.many('m0s', M0)
		var M2 = model().nest('m1', M1)
		// m1 has many m0s
		// m2 has one m1
		var m2 = new M2({m1: {m0s: [{x: 0}, {x: 1}]}})
		var m0 = m2.get('m1').get('m0s').find('x', 0)
		assert.strictEqual(m0.get('x'), 0)
	})

})
