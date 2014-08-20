(function() {
	Deferred = function() {
		var state = 'pending',
			tuples = [
				['resolve', 'done', 'resolved'],
				['reject', 'fail', 'rejected'],
				['notify', 'progress']
			],
			promise = {
				always: function(fn) {
					deferred.done(fn).fail(fn);
				},
				then: function(fnDone, fnFail, fnProgress) {
					deferred.done(fnDone);
					deferred.fail(fnFail);
					deferred.progress(fnProgress);
				},
				state: function() {
					return state;
				}
			},
			deferred = {
				promise: function() {
					return promise;
				}
			};
		for (var i = 0; i < 3; ++i) {
			(function(tuple) {
				var callbacks = [];
				var argsCache;
				deferred[tuple[0]] = function() {
					if (state != 'pending') {
						return;
					}
					for (var i = 0, l = callbacks.length; i < l; ++i) {
						callbacks[i].apply(promise, arguments);
					}
					if (tuple[2]) {
						state = tuple[2];
					}
					argsCache = arguments;
				};
				promise[tuple[1]] = function(fn) {
					if (state == tuple[2]) {
						fn.apply(promise, argsCache);
					}
					callbacks.push(fn);
					return promise;
				};
			})(tuples[i]);
		}
		return deferred;
	};

	Deferred.when = function(promise /* , ..., promiseN */ ) {
		var deferred = new Deferred(),
			length = arguments.length,
			remaining = length;

		if (length == 1) {
			return promise;
		}
		for (var i = 0; i < length; ++i) {
			promise = arguments[i];
			promise.done(function() {
				if (--remaining == 0) {
					deferred.resolve();
				}
			});
			promise.fail(function() {
				deferred.reject();
			});
		}
		return deferred.promise();
	};

})();