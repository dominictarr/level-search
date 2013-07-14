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

module.exports = function (db, indexDb) {

  function hasPath (obj, keys) {
    var _keys = keys.slice()
    while(_keys.length) {
      var k = _keys.shift()
      if(k === obj && !_keys.length)
        return true
      if (isRegExp(k)) {
        if (_keys.length === 0 && k.test(obj)) return true
 
        if (typeof obj !== 'object') return false
        var okeys = Object.keys(obj)
        for(var i = 0, l = okeys.length; i < l; i++) {
          if (k.test(okeys[i])) break
        }
        if (i === l) return false
        obj = obj[okeys[i]]
        continue
      }
      if(k === true && Array.isArray(obj)) {
        for(var i = 0, l = obj.length; i < l; i++) {
          var el = obj[i]
          if(hasPath(el, _keys))
            return true
        }
      }
      if('undefined' === typeof obj[k])
        return false
      else
        obj = obj[k]
    }
    return true
  }

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

  indexDb.explain = function (keys) {
    var k = keys.slice().reverse()
//    .filter(function (e) { return e !== true })

    while(k.length > 1 && (!isString(k[0]) || !isString(k[1]))) {
      k.shift()
    }

    var query = k.slice(0, 2).reverse() //.reverse()
    
    var min = query.slice()
    var max = query.slice()

    min.push(null)      //minimum
    max.push(undefined) //maximum

    return {
      values: false,
      _min: min, _max: max,
      min: encode(min),
      max: encode(max)
    }
  }

  indexDb.createSearchStream = function (keys, opts) {
    return toStream(null, indexDb.search(keys, opts))
  }

  indexDb.search = function (keys, _opts) {
    //get the last two items that are usable as an index.
    // [string, string]
    // example... if pattern is ["dependencies", "optimist", true]
    // then retrive all modules that depend on optimist
    if (isRegExp(keys[0])) {
      return function (_, cb) {
        return cb(new Error('first-key regular expressions not supported'))
      }
    }
    
    var opts = indexDb.explain(keys)
    opts.reverse = _opts && _opts.reverse
    opts.limit = _opts && _opts.limit
    opts.tail = _opts && _opts.tail
    
    for(var i = 0, l = keys.length; i < l; i++) {
      if (isRegExp(keys[i]) && !safeRegex(keys[i])) {
        return function (_, cb) {
          return cb(new Error('unsafe regular expression'))
        }
      }
    }
    return pull(
      pl.read(indexDb, opts),
      pull.map(function (key) {
        return decode(key)
      }),
      pull.map(function (data) {
        return data;
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
      pull.filter(function (data) {
        return hasPath(data.value, keys)
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

function isRegExp (x) { return {}.toString.call(x) === '[object RegExp]' }
