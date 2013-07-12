
var tape   = require('tape')
var search = require('../')
var level  = require('level-test')()
var sub    = require('level-sublevel')
var pull   = require('pull-stream')
var pl     = require('pull-level')

var db = sub(level('rebuild', {encoding: 'json'}))

tape('rebuild', function (t) {

  db.batch([
    {key: 'foo', value: {xyz: 123}, type: 'put'},
    {key: 'bar', value: {abc: 456}, type: 'put'},
    {key: 'baz', value: {ijk: 789}, type: 'put'}
  ], function (err) {
    if(err) throw err
    var index = search(db, 'index')

    index.rebuild(function (err) {
      if(err) throw err
        pull(
          index.search(['xyz']),
          pull.collect(function (err, ary) {
            if(err) throw err
            delete ary[0].index
            t.deepEqual(ary, [{key: 'foo', value: {xyz: 123}}])
            t.end()
          })
        )
    })
  })

})
