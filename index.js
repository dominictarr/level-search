var pairs = require('./pairs')
var bytewise = require('./bytewise')
var pl    = require('pull-level')
var pull  = require('pull-stream')
var toStream = require('pull-stream-to-stream')

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

  db.pre(function (op, add) {
    var keys = pairs(op.value)
    keys.forEach(function (e) {
      var f = e.slice(), g = e.slice()
      e.push(op.key)
      f.push(null); g.push({})
      add({key: encode(e), value: '0', type: 'put', prefix: indexDb})
    })
  })

  indexDb.explain = function (keys) {
    var k = keys.slice().reverse()
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

  indexDb.createSearchStream = function (keys) {
    return toStream(null, indexDb.search(keys))
  }

  indexDb.search = function (keys) {
    //get the last two items that are usable as an index.
    // [string, string]
    // example... if pattern is ["dependencies", "optimist", true]
    // then retrive all modules that depend on optimist
    var opts = indexDb.explain(keys)
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
      })
    )
  }

  return indexDb
}
