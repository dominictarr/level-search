var encode = require('./bytewise').encode
var compare = require('typewiselite').compare

function isString (s) {
  return 'string' === typeof s
}

function isNumber (n) {
  return 'number' === typeof n
}

function isPrimitive (o) {
  return isString(o) || isNumber(o)
}

function isObject (o) {
  return 'object' === typeof o && !isRegExp(o)
}

function isDate (d) {
  return d instanceof Date
}

function isIndexable (o) {
  return isPrimitive(o) || isDate(o) || isObject(o) && ( isPrimitive(o.min) || isPrimitive(o.max) )
}

function isRegExp (x) {
  return {}.toString.call(x) === '[object RegExp]'
}

function hasProp(obj, key) {
  return Object.hasOwnProperty.call(obj, key)
}

function stringify(e) {
  return isDate(e) ? e.toISOString() : e
}

var toIndexable = exports.toIndexable = function (e) {
  return (
    isPrimitive(e) ? e
  : isObject(e)    ? {min: stringify(e.min), max : stringify(e.max) }
  : stringify(e)
  )
}

exports.isRegExp = isRegExp

exports.explain = function (keys) {
  var k = keys.slice().reverse()

  while(k.length > 1 && (!isIndexable(k[0]) || !isIndexable(k[1]))) {
    k.shift()
  }

  var min = k.slice(0, 2).reverse().map(toIndexable)

  var max = min.slice()
  var last = min[min.length - 1]

  if(isObject(last)) {
    min[min.length - 1] = hasProp(last, 'min') ? last.min : null
    max[min.length - 1] = hasProp(last, 'max') ? last.max : undefined
  }

  min.push(null)      //minimum
  max.push(undefined) //maximum

  return {
    values: false,
    _min: min, _max: max,
    min: encode(min),
    max: encode(max)
  }
}

var hasPath = exports.hasPath = function (obj, keys) {
  var _keys = keys.map(toIndexable)
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

    else if(isObject(k) && (k.min || k.max)) {
      //greater than or equal to min, less than max
      return compare(obj, k.min) >= 0 && compare(obj, k.max) < 0
    }
    
    else if(k === true && Array.isArray(obj)) {
      for(var i = 0, l = obj.length; i < l; i++) {
        var el = obj[i]
        if(hasPath(el, _keys))
          return true
      }
    }
    else if('undefined' === typeof obj[k])
      return false
    else
      obj = obj[k]
  }
  return true
}

