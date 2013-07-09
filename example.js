var opts = require('optimist').argv
opts.clean = opts.clean === true

var level = require('level-test')(opts)
var search = require('./')
var sublevel = require('level-sublevel')

var pull = require('pull-stream')
var pfs  = require('pull-fs')
var pl   = require('pull-level')
var bytewise = require('bytewise')

var path = require('path')

var db = sublevel(level('level-search-example', {encoding: 'json'}))

var index = search(db, 'index')

if(opts.clean) {
  pull(
    pull.values([path.join(process.env.HOME, '.npm')]),
    pfs.star(),
    pfs.star(),
    pfs.resolve('package/package.json'),
    pfs.isFile(),
    pfs.readFile(JSON.parse),
    pull.map(function (pkg) {
      console.log(pkg.name, pkg.version)
      return {
        key: pkg.name + '!' + pkg.version, 
        value: pkg, type: 'put'
      }
    }),
    pl.write(db)
  )

} else if(opts.dump) {

  pull(
    pl.read(index),
    pull.map(function (data) {
      return bytewise.decode(new Buffer(data.key, 'base64'))
    }),
    pull.drain(console.log, console.log)
  )

} else {
  var q = opts._.map(function (e) {
    if('true' === e) return true
    if('false' === e) return false
    return e
  })

  if(opts.explain)
    return console.log(index.explain(q))
  
  pull(
    index.search(q),
    pull.map(function (data) {
      return data.value
    }),
    pull.drain(function (d) {
      console.log(d)
//      console.log({
//        name: d.name,
//        version: d.version,
//        dependencies: d.dependencies
//      })
    }, function (err) {
      if(err) throw err
    })
  )
}

