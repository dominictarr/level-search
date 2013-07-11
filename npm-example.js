
var os = require('os')
var opts   = require('optimist').argv
var level  = require('level-test')({clean: opts.clean === true})
var sub    = require('level-sublevel')
var search = require('./')
var shasum = require('shasum')

var db = sub(level('npmdump', {valueEncoding: 'json'}))
var index = search(db, 'index')

//then put loads of JSONdata into the database...
var JSONStream = require('JSONStream')
var request    = require('request')
var through    = require('through')

if(opts.clean) {
  request('http://isaacs.iriscouch.com/registry/_all_docs?include_docs=true')
  .pipe(JSONStream.parse(['rows', true, 'doc', 'versions', true]))
  .pipe(through(function (pkg) {
    var h = shasum(pkg)
    console.log(h, pkg.name, pkg.version)
    this.queue({key: h, value: pkg})
  }))
  .pipe(db.createWriteStream())
} else {
  index.createSearchStream(opts._)
  .pipe(through(function (data) {
    this.queue(JSON.stringify(data, null, 2) + '\n')
  }))
  .pipe(process.stdout)
}
