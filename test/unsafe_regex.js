var level    = require('level-test')()
var sublevel = require('level-sublevel')
var pull     = require('pull-stream')

var tape     = require('tape')
var search   = require('../')

var db = sublevel(level('level-search--unsafe-regex', {encoding: 'json'}))
var index = search(db, 'index')

tape('init', function (t) {
  db.batch([
    {
      key: 'dominictarr',
      value: {location: 'new zealand'},
      type: 'put'
    },
    {
      key: 'substack',  
      value: {location: 'Oakland, California'},
      type: 'put'
    },
    {
      key: 'maxogden',
      value: {location: 'oakland, ca'},
      type: 'put'
    }
  ], function (err) {
    if(err) throw err
    t.end()
  })
})

tape('unsafe regex', function (t) {
  t.plan(1)

  console.log(index.explain(['location',/(x+x+)+y/]))

  pull(
    index.search(['location',/(x+x+)+y/]),
    pull.collect(function (err, matches) {
      t.ok(/unsafe/i.test(err), 'unsafe regular expression detected')
    })
  )
})
