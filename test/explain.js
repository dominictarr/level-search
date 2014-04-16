
var tape = require('tape')
var explain = require('../util').explain
var encode = require('../bytewise').encode

var input = [
  {
    input: ['dependencies', 'optimist'],
    expected: {
      values: false,
      _min: ['dependencies', 'optimist', null],
      _max: ['dependencies', 'optimist', undefined],
    }
  },
  {
    input: [true, 'url', 'https://foobarbaz.com'],
    expected: {
      values: false,
      _min: ['url', 'https://foobarbaz.com', null],
      _max: ['url', 'https://foobarbaz.com', undefined],
    }
  },
  {
    input: [/^\d+$/, 'boo', 'blah'],
    expected: {
      values: false,
      _min: ['boo', 'blah', null],
      _max: ['boo', 'blah', undefined],
    }
  },
  {
    input: ['thing', {min: 0, max: 100}],
    expected: {
      values: false,
      _min: ['thing', 0, null],
      _max: ['thing', 100, undefined],
    }
  },

]


input.forEach(function (e) {
  tape('explain:' + JSON.stringify(e.input), function (t) {
    e.expected.min = encode(e.expected._min)
    e.expected.max = encode(e.expected._max)
    var actual = explain(e.input)
    console.log('actual', actual)
    console.log('expected', e.expected)
    t.deepEqual(actual, e.expected)
    t.end()
  })
})


