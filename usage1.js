(function() {

	function countdown() {
		var i = 5;
		var deferred = new Deferred();
		var timer = setInterval(function() {
			deferred.notify(i);
			if (i-- === 0) {
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
		xmlhttp.open('get', 'deferred.js', true);
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

	// Sample1
	countdown().progress(function(step) {
		console.debug('countdown', step);
	}).done(function(){
		console.debug('countdown done');
	});

	// Sample2
	ajax().then(function() {
		console.debug('ajax done');
	}, function() {
		console.debug('ajax fail');
	});

	// Sample3
	Deferred.when(countdown(), ajax()).done(function() {
		console.debug('when done');
	}).fail(function() {
		console.debug('when fail');
	});

})();
