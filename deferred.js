(function() {
	Deferred = function(fn) {
		var state = 'pending',
			tuples = [
				['resolve', 'done', 'resolved'],
				['reject', 'fail', 'rejected'],
				['notify', 'progress']
			],
			promise = {
				always: function(fn) {
					promise.done(fn).fail(fn);
				},
				then: function(fnDone, fnFail, fnProgress) {
					promise.done(fnDone);
					promise.fail(fnFail);
					promise.progress(fnProgress);
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
		if (fn) {
			return fn(deferred);
		}
		return deferred;
	};

	Deferred.when = function(promise /* , ..., promiseN */ ) {
		var deferred = Deferred(),
			length = arguments.length,
			remaining = length;

		for (var i = 0; i < length; ++i) {
			promise = arguments[i];
			if (typeof promise === 'function') {
				promise = promise(Deferred());
			}
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