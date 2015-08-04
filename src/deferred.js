/**
 * Go Deferred 2.0.0
 * https://github.com/Lanfei/deferred
 * (c) 2014 [Lanfei](http://www.clanfei.com/)
 * A lightweight implementation of Deferred/Promise.
 */

(function (global) {

	Deferred.version = '2.0.0';

	function each(obj, iterator) {
		var i, l, key;
		var typeStr = Object.prototype.toString.call(obj);
		if (typeStr === '[object Array]' || typeStr === '[object Arguments]') {
			for (i = 0, l = obj.length; i < l; ++i) {
				iterator(obj[i], i);
			}
		} else if (Object.keys) {
			var keys = Object.keys(obj);
			for (i = 0, l = keys.length; i < l; ++i) {
				key = keys[i];
				iterator(obj[key], key);
			}
		} else {
			for (key in obj) {
				iterator(obj[key], key);
			}
		}
	}

	function Deferred(fn) {
		var state = 'pending';
		var events = {
			done: {
				emitter: 'resolve',
				state: 'resolved',
				callbacks: [],
				args: null
			},
			fail: {
				emitter: 'reject',
				state: 'rejected',
				callbacks: [],
				args: null
			},
			progress: {
				emitter: 'notify',
				state: 'pending',
				callbacks: []
			}
		};
		var promise = {
			always: function (fnAlways) {
				return this.done(fnAlways).fail(fnAlways);
			},
			then: function (fnDone, fnFail, fnProgress) {
				return this.done(fnDone).fail(fnFail).progress(fnProgress);
			},
			pipe: function (doneFilter, failFilter, progressFilter) {
				var i = 0;
				var args = arguments;
				var filtered = Deferred();
				each(events, function (event, name) {
					var filter = args[i++];
					promise[name](function () {
						if (filter) {
							var result = filter.apply(promise, arguments);
							if (result !== undefined && result !== null) {
								filtered[event.emitter](result);
							}
						} else {
							filtered[event.emitter].apply(null, arguments);
						}
					});
				});
				return filtered.promise();
			},
			state: function () {
				return state;
			}
		};
		var deferred = {
			promise: function () {
				return promise;
			}
		};

		each(events, function (item, name) {
			var callbacks = item.callbacks;
			promise[name] = function (fn) {
				if (state !== 'pending' && state === item.state) {
					fn.apply(promise, item.args);
				} else if (fn) {
					callbacks.push(fn);
				}
				return promise;
			};
			deferred[item.emitter] = function () {
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
			var args = Array.prototype.slice.call(arguments, 1);
			fn.apply(deferred, args);
			return deferred.promise();
		}
		return deferred;
	}

	Deferred.when = function (promise /* , ..., promiseN */) {
		var args = [],
			deferred = Deferred(),
			length = arguments.length,
			remaining = length;

		each(arguments, function (promise, i) {
			if (typeof promise === 'function') {
				promise = promise(Deferred());
			}
			promise.done(function () {
				args[i] = arguments;
				if (--remaining === 0) {
					deferred.resolve.apply(null, args);
				}
			});
			promise.fail(function () {
				deferred.reject.apply(null, arguments);
			});
		});
		return deferred.promise();
	};

	Deferred.promisify = function (fn, withError) {
		return function () {
			var deferred = new Deferred();
			var args = Array.prototype.slice.call(arguments);
			withError = withError !== false;
			args.push(function (err) {
				if (withError && err) {
					deferred.reject(err);
				} else {
					var args = Array.prototype.slice.call(arguments, withError ? 1 : 0);
					deferred.resolve.apply(null, args);
				}
			});
			fn.apply(this, args);
			return deferred.promise();
		};
	};

	Deferred.fromStream = function (stream) {
		var deferred = new Deferred();
		stream.on('data', deferred.notify);
		stream.on('end', deferred.resolve);
		stream.on('error', deferred.reject);
		return deferred.promise();
	};

	Deferred.Deferred = Deferred;

	if (typeof define === "function") {
		if (define.cmd) {
			define(function () {
				return Deferred;
			});
		} else if (define.amd) {
			define("deferred", [], function () {
				return Deferred;
			});
		}
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = Deferred;
	} else {
		global.Deferred = Deferred;
	}

})(this);
