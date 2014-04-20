var pairs = require('./pairs')
var bytewise = require('./bytewise')
var pl    = require('pull-level')
var pull  = require('pull-stream')
var toStream = require('pull-stream-to-stream')
var safeRegex = require('safe-regex')

function isString (s) {
  return 'string' === typeof s
}

var encode = bytewise.encode
var decode = bytewise.decode

var u = require('./util')

module.exports = function (db, indexDb) {

  if(!indexDb)
    indexDb = 'search' //default to name of this module.

  if('string' === typeof indexDb)
    indexDb = db.sublevel(indexDb)

  function indexer (key, value) {
    return [[key, value]]
  }

  indexDb.indexer = indexer

  function createIndex (op, add) {
    var keys = pairs(op.value, indexer)
    keys.forEach(function (e) {
      var f = e.slice(), g = e.slice()
      e.push(op.key)
      add({key: encode(e), value: '0', type: 'put', prefix: indexDb})
    })
  }

  db.pre(createIndex)

  indexDb.rebuild = function (cb) {
    pull(
      pl.read(db),
      pull.map(function (op) {
        var batch = []
        createIndex(op, function (ch) {
          batch.push(ch)
        })
        return batch
      }),
      pull.flatten(),
      pl.write(indexDb, cb)
    )
  }

  indexDb.explain = u.explain

  indexDb.createSearchStream = function (keys, opts) {
    return toStream(null, indexDb.search(keys, opts))
  }

  indexDb.search = function (keys, _opts) {
    //get the last two items that are usable as an index.
    // [string, string]
    // example... if pattern is ["dependencies", "optimist", true]
    // then retrive all modules that depend on optimist
    keys = keys.map(u.toIndexable)
    
    var opts = indexDb.explain(keys)
    opts.reverse = _opts && _opts.reverse
    opts.limit = _opts && _opts.limit
    opts.tail = _opts && _opts.tail
    
    for(var i = 0, l = keys.length; i < l; i++) {
      if (u.isRegExp(keys[i]) && !safeRegex(keys[i])) {
        return function (_, cb) {
          return cb(new Error('unsafe regular expression'))
        }
      }

      if(u.isRegExp(keys[i])){
        opts.limit = null
      }
    }

    // keep track of soft-limit (when there is a RegExp)
    // this uses pull.take so the level stream is cancelled when the limit is hit
    var counter = 0;

    return pull(
      pl.read(indexDb, opts),
      pull.map(function (key) {
        return decode(key)
      }),
      pull.unique(function (key) {
        return key[key.length - 1];
      }),
      pull.asyncMap(function (key, cb) {
        var k = key.pop()
        db.get(k, function (err, val) {
          cb(err, {key: k, value: val, index: key})
        })
      }),
      pull.take(function (data){
        return _opts && _opts.limit ? counter<_opts.limit : true
      }),
      pull.filter(function (data) {
        if(u.hasPath(data.value, keys)){
          if(_opts && _opts.limit) counter++
          return true
        }
      }),
      pull.map(function (data) {
        if(_opts && _opts.keys == false)
          return data.value
        else if(_opts && _opts.values == false)
          return data.key
        return data
      })
    )
  }

  return indexDb
}

