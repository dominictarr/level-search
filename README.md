# level-search

index every property in leveldb

[![travis](https://travis-ci.org/dominictarr/level-search.png?branch=master)
](https://travis-ci.org/dominictarr/level-search)

[![testling](http://ci.testling.com/dominictarr/level-search.png)
](http://ci.testling.com/dominictarr/level-search)

## example

First, install the indexer,
and then fill your leveldb with data.

``` js
var level  = require('level')
var sub    = require('level-sublevel')
var search = require('level-search')

var db = sub(level(pathToLevelDir, {valueEncoding: 'json'}))
var index = search(db, 'index')

//then put loads of JSONdata into the database...
streamOfJSON //with {key:..., value:...}
.pipe(db.createWriteStream())

//then query the database like this!

//retrive all the modules someone wrote...
index.createSearchStream(['maintainers', true, 'name', username])
  .on('data', console.log)
```

## methods

``` js
var search = require('level-search')
```

### var index = search(db, indexName)

Create a new search index inside `db` the sublevel string name `indexName`.

### index.createSearchStream(keys, opts)

Return a readable stream from an array search path `keys`.
`opts` are passed to the underlying `db.createReadStream()` call.

`keys` works like [JSONStream](https://npmjs.org/package/JSONStream).parse()
where each item describes a key more deeply nested inside the document. At leaf
nodes, equality or regex test is used. At non-leaf nodes, keys are traversed or
searched for as the first matching regex key name.

Each item in `keys` can be a string, boolean, or regex. The boolean `true` means
always match and `false` means never match.

## rebuilding the index

If want to add search to old data,
or have been messing with stuff,
you'll need to rebuild indexes.

``` js
index.rebuild(function (err) {
  //the search index is ready to be used again
})
```

If you insert keys while the rebuild, strange things could 
happen, so if you do that, you need to rebuild again.

## License

MIT
