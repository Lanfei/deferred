var fs = require('fs');
var Deferred = require('..');

var readDir = Deferred.promisify(fs.readdir);

readDir('.').done(function (data) {
	console.log(data);
}).fail(function (err) {
	console.error(err);
});
