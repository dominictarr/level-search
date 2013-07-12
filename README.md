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
var search = require('search')

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
