//This one is neat!
//  The formal name is a Read-Through Cache, but it is akin to a caching proxy
//  You use it when you have an async resource that you want to cache.
//  The simple, obvious, and wrong way of doing that is:
//    1. check cache.
//    2. if miss, then begin async fetch
//    3. On result, populate cache
//
//  This is wrong because multiple cache misses will trigger multiple fetches.
//
//  Instead, we want to do this:
//    1. request resource
//    2. if miss, add to list of pending requestors
//    3. if first miss, begin async fetch
//    4. on result, flush requestor list
//
//  This enqueues all requests for a resource until it is available.
//
//  Use:
//  // construct the cache with our cache-filling function and a ttl for values
//  cache = new ReadThroughCache(keyToValue, timeToLive);
//
//  //to use the cache, request a key. keyToValue will be called on miss
//  //  your callback will be called with error, value (just like the node libs)
//  cache.get('http://api.twitter.com/1/statuses/public_timeline.json', callback)
//
//  The trickiest part is in your keyToValue function.
//
//  The function that you provide will be passed
//    key, cache
//
//  The last thing your keyToValue function should do is: 
//    cache.set(key, value) or
//    cache.error(key, reason)
//
//  On error, we notify all listeners and clear the queue.
//  This means that the next request will retry, IE: errors arent cached.
var ExpiringCollection = require("./expiring-collection").ExpiringCollection,
	sys = require("sys");

var ReadThroughCache = function(keyToValue, timeToLive) {
	this.keyToValue = keyToValue;
	this.expiring_collection = new ExpiringCollection(timeToLive);
	this.observers = {};
};

ReadThroughCache.prototype = {
	set: function(key, value) {
		this.expiring_collection.set(key, value);

		var error = null;
		this.notifyObservers(key, error, value);
	},

	get: function(key, callback) {
		if (callback instanceof Function);
		else {
			throw ("Callback must be function");
		};

		//return it if we got it
		if (this.expiring_collection[key]) {
			callback(null, this.expiring_collection[key]);
			return;
		}

		//get in line for results if there is a line
		if (this.observers[key]) {
			this.observers[key].push(callback);
			return;
		}

		//otherwise, form a new line with just me and kick off the asynch job
		this.observers[key] = [callback];
		this.keyToValue(key, this);
	},

	error: function(key, reason) {
		var value = null;
		this.notifyObservers(key, reason, value);
	},

	notifyObservers: function(key, error, value) {
		var listeners = this.observers[key];
		if (listeners && listeners.length) {
			for (var i = 0, l = listeners.length; i < l; i++) {
				listeners[i](error, value);
			}

			this.observers[key] = false;
		}
	},

	stopExpirationTimeout: function() {
		this.expiring_collection.stopExpirationTimeout();
	}
};

//inspiration taken from the far more lambda-style node-git project by creationix
if (typeof(exports) === "object") {
	exports.ReadThroughCache = ReadThroughCache;
}
