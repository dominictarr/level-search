
var pairs = require('../pairs')
var pkg   = require('../package.json')
var bw    = require('../bytewise')

var x = pairs(pkg)
var i = x.map(function (e) {
  e = e.slice()
  e.push(pkg.name + '@' + pkg.version)
  return bw.encode(e)
}).sort()

console.log(i)

x.forEach(function (e) {

  var min = e.slice()
  min.push(null)
  min = bw.encode(min)

  var max = e.slice()
  max.push(undefined)
  max = bw.encode(max)

  var matched = i.filter(function (e) {
    var test = e
//    console.log(bw.decode(e))
//    console.log(min, test, max)
//    console.log(min <= test, test <= max)
    return min <= test && test <= max
  })

  if(!matched.length) {
    var trg = e.slice()
    e.push(pkg.name + '@' + pkg.version)
    console.log('min:', min)
    console.log('trg:', bw.encode(trg))
    console.log('max:', max)

  }


  console.log({query: e, match: matched.map(bw.decode)})
})
