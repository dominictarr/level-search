var level    = require('level-test')()
var sublevel = require('level-sublevel')
var pull     = require('pull-stream')

var tape     = require('tape')
var search   = require('../')

var db = sublevel(level('level-search--regex-multi', {encoding: 'json'}))
var index = search(db, 'index')

tape('init', function (t) {
  db.batch([
    {
      key: 'dominictarr',
      value: {location: {country: 'new zealand', city:'aukland'}},
      type: 'put'
    },
    {
      key: 'substack',  
      value: {location: {country: 'usa', city: 'Oakland'}},
      type: 'put'
    },
    {
      key: 'hank',  
      value: {location: {country: 'usa', state: 'maryland'}},
      type: 'put'
    },
    {
      key: 'maxogden',
      value: {location: {country: 'usa', city: 'oakland'}},
      type: 'put'
    },
    {
      key: 'chrisdickinson',
      value: {location: {country: 'usa', city: 'portland'}},
      type: 'put'
    },
    {
      key: 'raynos',
      value: {location: {country: 'usa', city: 'san francisco'}},
      type: 'put'
    }
  ], function (err) {
    if(err) throw err
    t.end()
  })
})

tape('multiple regex search', function (t) {
  t.plan(1)
  console.log(index.explain(['location', /^(city|state)$/i, /land$/i]))

  pull(
    index.search([ 'location', /^(city|state)$/i, /land$/i]),
    pull.collect(function (err, matches) {
      var names = matches.map(function (row) { return row.key })
      t.deepEqual(names.sort(), [ 
        'dominictarr', 'substack', 'hank', 'maxogden', 'chrisdickinson'
      ].sort())
    })
  )
})



