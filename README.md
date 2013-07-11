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

## License

MIT
