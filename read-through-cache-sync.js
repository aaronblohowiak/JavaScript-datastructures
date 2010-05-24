//a synchronous read-through-cache is a dictionary with a default value handler.
//
//  Use:
//    function keyToValue(key){ return "missed" };
//    dict = new Dictionary(onMiss);
//    assert(dict.get('anything') === 'missed');
//    dict.set('key', 'value');
//    assert(dict.get('key') === 'value');
//
//    this will actually set the key to the default value on miss.
//    
var ReadThroughCacheSync = function(keyToValue) {
	this.dict = {};
	this.keyToValue = keyToValue;
};

ReadThroughCacheSync.prototype = {
	get: function(key) {
		if (!this.dict.hasOwnProperty(this.prefix+key)) {
			this.dict[this.prefix + key] = this.keyToValue(key);
		}

		return this.dict[this.prefix + key];
	},

	set: function(key, value) {
		this.dict[this.prefix + key] = value;
	}
};

//inspiration taken from the far more lambda-style node-git project by creationix
if (typeof(exports) === "object") {
	exports.ReadThroughCacheSync = ReadThroughCacheSync;
}
