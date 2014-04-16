var encode = require('./bytewise').encode

function isString (s) {
  return 'string' === typeof s
}

function isRegExp (x) { return {}.toString.call(x) === '[object RegExp]' }

exports.isRegExp = isRegExp

exports.explain = function (keys) {
    var k = keys.slice().reverse()
//    .filter(function (e) { return e !== true })

    while(k.length > 1 && (!isString(k[0]) || !isString(k[1]))) {
      k.shift()
    }

    var query = k.slice(0, 2).reverse() //.reverse()
    
    var min = query.slice()
    var max = query.slice()
    var last = min[min.length - 1]

    if( 'object' === last && (
        Object.hasOwnProperty.call(last, 'min') ||
        Object.hasOwnProperty.call(last, 'max')
      )) {
      min[min.length - 1] = last.min || null
      max[min.length - 1] = last.max || undefined
    } else {
      min.push(null)      //minimum
      max.push(undefined) //maximum
    }

    return {
      values: false,
      _min: min, _max: max,
      min: encode(min),
      max: encode(max)
    }
  }


var hasPath = exports.hasPath = function (obj, keys) {
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

