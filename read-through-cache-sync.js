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
var ReadThroughCacheSynch = function(keyToValue) {
	this.dict = {};
	this.keyToValue = keyToValue;
};

ReadThroughCacheSynch.prototype = {
	get: function(key) {
		if (this.dict.hasOwnProperty(key)) {
			return key;
		} else {
			this.dict[key] = this.keyToValue(key);
			return this.dict[key];
		}
	},

	set: function(key, value) {
		this.dict[key] = value;
	}
};

//inspiration taken from the far more lambda-style node-git project by creationix
if (typeof(exports) === "object") {
	exports.ReadThroughCacheSynch = ReadThroughCacheSynch;
}

