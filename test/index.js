var level    = require('level-test')()
var sublevel = require('level-sublevel')
var pull     = require('pull-stream')

var tape     = require('tape')
var search   = require('../')

var db = sublevel(level('level-search--simple', {encoding: 'json'}))
var index = search(db, 'index')

tape('init', function (t) {
  db.batch([
    {key: 'foo1', value: {foo: {bar: 1}}, type: 'put'},
    {key: 'foo2', value: {foo: {baz: 2}}, type: 'put'},
    {key: 'foo3', value: {baz: {bar: 3}}, type: 'put'},
    {key: 'foo4', value: {foo: {bar: 'blerg'}}, type: 'put'},
    {key: 'foo5', value: {foo: {bar: {baz: 3}}}, type: 'put'}
  ], function (err) {
    if(err) throw err
    t.end()
  })
})

tape('simple', function (t) {

  pull(
    index.search(['foo', 'bar']),
    pull.collect(function (err, ary) {
      console.log(ary = ary.map(function (e) { return e.value }))
      t.deepEqual(ary, [
        {foo: {bar: 1}},
        {foo: {bar: 'blerg'}},
        {foo: {bar: {baz: 3}}}
      ])

      t.end()
    })
  )
})


tape('value', function (t) {

  pull(
    index.search(['foo', 'bar', 'blerg']),
    pull.collect(function (err, ary) {
      console.log(ary = ary.map(function (e) { return e.value }))
      t.deepEqual(ary, [
        {foo: {bar: 'blerg'}},
      ])
      t.end()
    })
  )

})
