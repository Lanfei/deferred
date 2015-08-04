var fs = require('fs');
var Deferred = require('..');

var exists = Deferred.promisify(fs.exists, false);
var readFile = Deferred.promisify(fs.readFile);

Deferred.when(exists('package.json'), readFile('index.js')).done(function (result1, result2) {
	console.log(result1, result2);
}).fail(function (err) {
	console.error(err);
});