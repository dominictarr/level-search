var level    = require('level-test')()
var sublevel = require('level-sublevel')
var pull     = require('pull-stream')

var tape     = require('tape')
var search   = require('../')

var db = sublevel(level('level-search--regex', {encoding: 'json'}))
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

tape('single regex search', function (t) {

  console.log(index.explain(['location', /\boakland\b/i]))

  pull(
    index.search(['location', /\boakland\b/i]),
    pull.collect(function (err, matches) {
      var results = matches.reduce(function (acc, row) {
        acc[row.key] = row.value
        return acc
      }, {})
      t.deepEqual(results, {
        'substack': {location: 'Oakland, California'},
        'maxogden': {location: 'oakland, ca'}
      })
      t.end()
    })
  )
})



