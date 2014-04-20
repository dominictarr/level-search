/* { key: 'maa', value: { name: 'maa' }, index: [ 'name', 'maa' ] }
{ key: 'mab', value: { name: 'mab' }, index: [ 'name', 'mab' ] }
{ key: 'mac', value: { name: 'mac' }, index: [ 'name', 'mac' ] }
{ key: 'mad', value: { name: 'mad' }, index: [ 'name', 'mad' ] }
{ key: 'mae', value: { name: 'mae' }, index: [ 'name', 'mae' ] }
{ key: 'maf', value: { name: 'maf' }, index: [ 'name', 'maf' ] }
{ key: 'mag', value: { name: 'mag' }, index: [ 'name', 'mag' ] }
{ key: 'mah', value: { name: 'mah' }, index: [ 'name', 'mah' ] }
{ key: 'mai', value: { name: 'mai' }, index: [ 'name', 'mai' ] }
{ key: 'maj', value: { name: 'maj' }, index: [ 'name', 'maj' ] }
{ key: 'mak', value: { name: 'mak' }, index: [ 'name', 'mak' ] }
{ key: 'mal', value: { name: 'mal' }, index: [ 'name', 'mal' ] }
{ key: 'mam', value: { name: 'mam' }, index: [ 'name', 'mam' ] }
{ key: 'man', value: { name: 'man' }, index: [ 'name', 'man' ] }
{ key: 'mao', value: { name: 'mao' }, index: [ 'name', 'mao' ] }
{ key: 'map', value: { name: 'map' }, index: [ 'name', 'map' ] }
{ key: 'maq', value: { name: 'maq' }, index: [ 'name', 'maq' ] }
{ key: 'mar', value: { name: 'mar' }, index: [ 'name', 'mar' ] }
{ key: 'mas', value: { name: 'mas' }, index: [ 'name', 'mas' ] }
{ key: 'mat', value: { name: 'mat' }, index: [ 'name', 'mat' ] }
{ key: 'mau', value: { name: 'mau' }, index: [ 'name', 'mau' ] }
{ key: 'mav', value: { name: 'mav' }, index: [ 'name', 'mav' ] }
{ key: 'maw', value: { name: 'maw' }, index: [ 'name', 'maw' ] }
{ key: 'max', value: { name: 'max' }, index: [ 'name', 'max' ] }
{ key: 'may', value: { name: 'may' }, index: [ 'name', 'may' ] }
{ key: 'maz', value: { name: 'maz' }, index: [ 'name', 'maz' ] } */
 
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

tape('regexp search gets an end event', function(t){
  var start = Date.now();
  var matches = [];
 
  index.createSearchStream(['name', /^ma/])
  .on('data', function(name) {
    console.log(name);
    matches.push(name);
  })
  .on('end', function() {
    t.equal(matches.length, 26)
    t.end()
  })
})