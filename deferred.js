(function() {

	var each = function(obj, iterator) {
		for (var key in obj) {
			iterator(obj[key], key);
		}
	};

	Deferred = function(fn) {
		var state = 'pending',
			events = {
				done: {
					emiter: 'resolve',
					state: 'resolved',
					callbacks: [],
					args: null
				},
				fail: {
					emiter: 'reject',
					state: 'rejected',
					callbacks: [],
					args: null
				},
				progress: {
					emiter: 'notify',
					state: 'pending',
					callbacks: []
				}
			},
			promise = {
				always: function() {
					promise.done(fn).fail(fn);
				},
				then: function(fnDone, fnFail, fnProgress) {
					var i = 0;
					var args = arguments;
					var filtered = Deferred();
					each(events, function(item, name) {
						var fn = args[i++];
						promise[name](function() {
							if (fn) {
								filtered[item.emiter](fn.apply(promise, arguments));
							} else {
								filtered[item.emiter].apply(null, arguments);
							}
						});
					});
					return filtered.promise();
				},
				pipe: function(fn){
					var deferred = Deferred();
					promise.done(function(){
						var promise = fn.apply(null, arguments);
						if (typeof promise === 'function') {
							promise = promise(Deferred());
						}
						promise.done(deferred.resolve).fail(deferred.reject).progress(deferred.notify);
					});
					return deferred.promise();
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

		each(events, function(item, name) {
			var callbacks = item.callbacks;
			promise[name] = function(fn) {
				if (state !== 'pending' && state === item.state) {
					fn.apply(promise, item.args);
				} else if (fn) {
					callbacks.push(fn);
				}
				return promise;
			};
			deferred[item.emiter] = function() {
				if (state !== 'pending') {
					return;
				}
				for (var i = 0, l = callbacks.length; i < l; ++i) {
					callbacks[i].apply(promise, arguments);
				}
				state = item.state;
				item.args = arguments;
				if (state !== 'pending') {
					item.callbacks = null;
				}
			};
		});
		if (fn) {
			return fn.call(deferred, deferred);
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
				if (--remaining === 0) {
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