# citizen

minimal and intelligent data models for your client-side parties with computed properties and change events.

ie6+

# installation

[component](github.com/component/component)

```sh
component install the-swerve/citizen
```

# api

## defining

#### model()

```js
var model = require('citizen')
var Post = model()
```

#### Model.where(name, fn, properties)

Create a computed property by using `where`, setting the name, and using a
function whose parameters are other properties that it depends on. Finally, list those properties at the end so we can recognize which ones this depends on.

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

## instantiating

#### new Model(data)

Instantiate a new model with provided data.

```js
var post = new Post({title: 'sup friends'})
```

#### Model#get(), Model#get(property), Model#get(properties)

Retrieve the property for model, including computed properties.

```js
post.title // 'sup friends'
post.capitalized_title // 'Sup Friends'
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

## events

citizen emits `'change {property}'` events when a property has been set.

```js
post.on('change title', function() { console.log('ready to party') })
post.set('title', 'js party')
// console says 'ready to party'
```

# test

install [component-test](https://github.com/MatthewMueller/component-test) and run:

```js
component test browser
```
