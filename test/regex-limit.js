var level    = require('level-test')()
var sub = require('level-sublevel');

var tape     = require('tape')
var search = require('../');

var db = sub(level('level-search--regex-end-event', {encoding: 'json'}))
var index = search(db, 'index');
var values = Math.pow(26, 3);

tape('init', function (t) {

  var ops = [];
   
  for (var i = 0; i < 26; i++) {
    for (var j = 0; j < 26; j++) {
      for (var k = 0; k < 26; k++) {
        var name = String.fromCharCode(97 + i)
          + String.fromCharCode(97 + j)
          + String.fromCharCode(97 + k);
        ops.push({ type: 'put', key: name, value: { name: name } });
      }
    }
  }
 
  db.batch(ops, function(err) {
    if (err) throw err
    t.end()
  })
})


tape('regexp search with a limit', function(t){
  var start = Date.now();
  var matches = [];
 
  index.createSearchStream(['name', /^ma/], { limit: 10 })
  .on('data', function(name) {
    console.log(name);
    matches.push(name);
  })
  .on('end', function() {
    t.equal(matches.length, 10)
    t.end()
  })
})