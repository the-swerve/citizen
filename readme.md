# citizen

minimal and intelligent data models for your js parties with computed properties and change events.

Data models provided by citizen are _just_ data models. You can treat them like
functional data structures. Rather than nesting services like syncing,
validation, etc within the data model, use the data model as the _boundary_
between these services. For example, instead of `data.save()`, do
rest_route.save(data).

ie6+

# installation

with [component](https://github.com/component/component)

```sh
component install the-swerve/citizen
```

# api

## definitions

#### model()

```js
var model = require('citizen')
var Post = model()
```

#### model.where(name, fn, dependent_properties)

Create a computed property by using `where`, setting the name, and using a
function whose parameters are other properties that it depends on. Finally, list those properties at the end so we can recognize which ones it depends on.

```js
Post.where('capitalized_title', function(title) {
	var words = title.split(' ')
	var caps = words.map(function(w) {
		return w[0].toUpperCase() + w.substr(1).toLowerCase()
	})
	return caps.join(' ')
}, ['title'])
```

The above will set a 'capitalized_title' property based on a post's title property.

Properties are lazy. They will be computed when they are accessed. You also don't need to set the dependent properties before depending on them.

## instances

#### new Model(data)

Instantiate a new model with provided data.

```js
var post = new Post({title: 'sup friends'})
```

#### Model#get(), Model#get(property), Model#get(properties)

Retrieve the property for model, including computed properties.

```js
post.get('title') // 'sup friends'
post.get('capitalized_title') // 'Sup Friends'
```

Pass any number of properties as parameters in `get` to get an array of values back.

```js
post.get('title', 'capitalized_title') // ['sup friends', 'Sup Friends']
```

If you don't pass anything, it simply returns all of the data.

```js
post.get() // {title: 'sup friends', capitalized_title: 'Sup Friends'}
```

#### Model#set(data), Model#set(property, value)

Pass an object of properties mapped to values to set new data.

```js
post.set({'title', "lol javascript"})
```

You can also just pass two params to easily set one property

```js
post.set('title', "what is this i don't even")
```

#### Model#has(property)

Test whether a model has a property

```js
post.has('title') // true
post.has('wut') // false

post.set({thing: undefined})
post.has('thing') // false

post.set({another_thing: null})
post.has('another_thing') // true
```

## nesting

If you want your model to have another model nested inside of it, use `.nest`

#### Model.nest(property, Model)

For a single nesting:

```js
var Comment = model()
var Post = model()
Post.nest('comment', Comment)
var post = new Post({comment: {text: 'what'}})

var comment = post.get('comment')
comment.get('text') // 'what'
```

Any computed properties and events for the Comment model will be accessible through post and from comment.

#### Model.nest.many(property, Model)

If you want your model to have an array of other models nested inside of it, use `many`

Create a post with a nested collection of comments under the property 'comments'

```js
var Comment = model()

// Take any comment and append #horse_js
Comment.where('better_comment', function(text) {
	return text + ' #horse_js'
}, ['text'])

var Post = model()
Post.nest.many('comments', Comment)
var post = new Post({comments: [{text: 'wut', text: 'wat'}]})

var comments = post.get('comments')
comments.arr[0].better_comment // 'wat #horse_js'
```

Now, Post has a property called 'comments' that holds an array of Comments, with each Comment having its own set of computed properties and change events that are settable and gettable through a post. Reminder: computed properties are lazy; they are only computed on `get`.

#### collection.find(property, val), collection.find(property, fn)

Retrieve an element in a collection by a property and value.

```js
var comments = post.get('comments')
var comment = comments.find('id', 1)
```

If more than one comment is found matching the given id, they are all returned as an array. If none are found, undefined is returned.

Optionally pass in a function:

```js
var recent = comments.find('month', function(comment) {
	return comment.get('date') > one_month_ago
})
```

You can do a find function on a computed property. Just remember that if your computed property is expensive, the find function is going to run on every single element in the collection.

#### collection.arr

Use this property to access the collection's array of models.

## events

citizen emits `'change'` and `'change {property}'` events when a property has been set.

```js
var changed = false
post.on('change title', function() { changed = true })
post.set('title', 'js party')
// changed === true
```

citizen also emits `'change {computed_property}'` events for computed properties! If any properties that a computed property depends on are changed, a change event for that computed property is emitted.

```js
var changed = false
post.on('change capitalized_title', function() { changed = true})
post.set('title', 'such compute wow amaze')
// changed === true
```

You can get `'change {nested}'` and `'change {collection}'` events as expected, and for changes on models within collections, those individual models will emit their own change events.

# test

install [component-test](https://github.com/MatthewMueller/component-test) and run:

```js
component test browser
```
