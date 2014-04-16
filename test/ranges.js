
var level    = require('level-test')()
var sublevel = require('level-sublevel')
var pull     = require('pull-stream')
var pl       = require('pull-level')
var decode   = require('../bytewise').decode
var pairs    = require('../pairs')

var tape     = require('tape')
var search   = require('../')

var db = sublevel(level('level-search--ranges', {encoding: 'json'}))
var index = search(db, 'index')


tape('date ranges', function (t) {
  var start = new Date('2000-01-01'), rolling = +start
  var total = 1000, gap = 2* ((Date.now() - +start) / total)
  pull(
    pull.count(total),
    pull.map(function (e) {
      return {
        key: '#' + Math.random(),
        value: {
          count: e,
          date: new Date(rolling += Math.random()*gap)
        }
      }
    }),
//    pull.through(function (e) { console.log(JSON.stringify(e))}),
    pl.write(db, function () {
      console.log('ready')
      var min, max
      var query = ['date', {
          min: min = new Date(+start + gap*total*0.25),
          max: max = new Date(+start + gap*total*0.3)
        }]

      console.log(index.explain(query))

      pull(

        ( true
        ? index.search(query)
        : pl.read(index, index.explain(query))),
        pull.through(function (e) {
          console.log(decode(e) || e)
        }),
        pull.collect(function (err, ary) {
          if(err) throw err
          ary.forEach(function (e) {
            var date = new Date(e.value.date)
            t.ok(date >= min, date + ' >= ' + min)
            t.ok(date >= min, date + ' <  ' + min)
          })
          t.end()
        })
      )
      //t.end()
    })
  )

})
