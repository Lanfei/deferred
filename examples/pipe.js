var Deferred = require('..');

function countdown() {
	var deferred = new Deferred();
	var i = 5;
	var timer = setInterval(function () {
		deferred.notify(i);
		if (i-- === 0) {
			deferred.resolve('Hi');
			clearInterval(timer);
		}
	}, 300);
	return deferred.promise();
}

var foo = countdown().pipe(function (msg) {
	return msg + ', Foo';
}, null, function (num) {
	if (num % 2 === 0) {
		return num;
	} else {
		return null;
	}
});

foo.progress(function (step) {
	console.log('countdown', step);
}).done(function () {
	console.log('countdown done');
});