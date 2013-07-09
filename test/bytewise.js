

var bytewise = require('bytewise')

function encode(obj, enc) {
  return bytewise.encode(obj).toString(enc)
}

var key = encode(['name', 'optimist', 'optimist@hash'], 'hex')
var key = encode(['name', 'optimoeuaist', 'optimist@hash'], 'hex')

var min = encode(['name', null], 'hex')
var max = encode(['name', undefined], 'hex')

console.log(min < key, key < max)

