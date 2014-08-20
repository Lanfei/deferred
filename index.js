(function() {

	function fn() {
		var i = 0;
		var deferred = new Deferred();
		var timer = setInterval(function() {
			deferred.notify(++i);
			if (i == 5) {
				deferred.resolve('Hi');
				clearInterval(timer);
			}
		}, 300);
		return deferred.promise();
	};

	function ajax() {
		var deferred = new Deferred();
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.open('get', 'index.html', true);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					deferred.resolve(xmlhttp.responseText);
				} else {
					deferred.reject(xmlhttp.status);
				}
			}
		};
		xmlhttp.send();
		return deferred.promise();
	}

	var p = Deferred.when(fn().progress(function(step) {
		console.debug(step);
	}), ajax()).done(function() {
		console.debug('done');
	}).done(function() {
		console.debug(this, arguments);
	}).fail(function() {
		console.debug('fail');
	}).fail(function() {
		console.debug(this, arguments);
	});
})();