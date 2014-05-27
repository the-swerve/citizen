# citizen

Minimal data models with change events and computed properties for your js views.

Data models provided by citizen are _just_ data models. They don't come with
syncing or validation; other libraries can provide that.

ie6+

# installation

with [component](https://github.com/component/component)

```sh
component install the-swerve/citizen
```

# api

#### Model.clone()

Instantiate by cloning Model.

```js
var Model = require('citizen')
var post = Model.clone()
```

#### Model.set(data)

Pass an object of properties mapped to values to set new data.

```js
post.set({title: "lol javascript"})
```

#### Model.get(property)

Retrieve any property, including computed properties.

```js
post.get('title') // 'sup friends'
```

#### Model.where(name, fn)

Create a computed property by using `where`, setting the property name, and
using a function whose parameters are other properties that it depends on.

```js
post.where('capitalized_title', function(title) {
	var words = title.split(' ')
	var caps = words.map(function(w) {
		return w[0].toUpperCase() + w.substr(1).toLowerCase()
	})
	return caps.join(' ')
})

post.get('title') // 'sup friends'
post.get('capitalized_title') // 'Sup Friends'
```

The above will set a 'capitalized_title' property based on a post's title property.

Properties are lazy. They will be computed when they are accessed. You also don't need to set the dependent properties before depending on them.

#### Model.has_one(property_name, Model)

`has_one` creates a nested Model. It lets you have a field in your model that's automatically instanstiated as another model.

```js
var comment = Model()
post.has_one('comment', Comment)
post.set({comment: {text: 'my comment'}, plain_obj: {plain_prop: 'hallo welt'}})

post.get('comment').get('text') // 'my comment'
post.get('plain_obj').plain_prop // 'hallo welt'
```

That way, every time you set a comment object inside post, it will be a Model rather than just a plain Object.

#### Model.has_many(property, Model)

If you want your model to have an array of other models nested inside of it, use `has_many`

Create a post with a nested collection of comments under the property 'comments'

```js
var comment = Model()

// Take any comment and append #syngery
Comment.where('better_comment', function(text) {
	return text + ' #synergy'
})

var post = Model()
post.has_many('comments', Comment)
var post = new Post({comments: [{text: 'wut', text: 'wat'}]})

var comments = post.get('comments')
comments[0].better_comment // 'wut #synergy'
```

Now, Post has a property called 'comments' that holds an array of comment Models, with each Comment having its own set of computed properties and change events that are settable and gettable through a post. This nested array of models will only get instantiated when the whole thing is `set`, and not on push or assigning to individual indexes (for now).

## events

citizen emits `'change'` and `'change {property}'` events when a property has been set.

```js
var changed = false
post.on('change title', function() { changed = true })
post.set('title', 'js party')
// changed === true
```

citizen also emits `'change {computed_property}'` events for computed properties. If any properties that a computed property depends on are changed, a change event for that computed property is emitted.

```js
var changed = false
post.on('change capitalized_title', function() { changed = true})
post.set('title', 'such compute wow amaze')
// changed === true
```

You can get `'change {has_one}'` and `'change {has_many}'` events as expected, and for changes on models within collections, those individual models will emit their own change events.

# test

install [component-test](https://github.com/MatthewMueller/component-test) and run:

```js
component test browser
```
