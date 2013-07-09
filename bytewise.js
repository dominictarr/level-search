var bytewise = require('bytewise')

exports.encode = function (key) {
  return bytewise.encode(key).toString('hex')
}

exports.decode = function (key) {
  return bytewise.decode(new Buffer(key, 'hex'))
}

