var fs = require('fs');
var Deferred = require('..');

var deferred = Deferred.fromStream(fs.createReadStream('README.md'));

var length = 0,
	chunks = [];
deferred.progress(function (chunk) {
	chunks.push(chunk);
	length += chunk.length;
}).done(function () {
	var data = Buffer.concat(chunks, length);
	console.log(data.toString());
}).fail(function (err) {
	console.log(err);
});
