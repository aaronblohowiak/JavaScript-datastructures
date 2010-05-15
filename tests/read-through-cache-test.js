var ReadThroughCache = require("../read-through-cache").ReadThroughCache,
	sys = require("sys"),
	p = sys.puts;

var assert = function(cond, stmt) {
	if (cond) {
		p("PASS: " + stmt);
	} else {
		p("FAIL: " + stmt);
	}
};

var readThroughCacheTest = function() {
  var defaultTimeToLive = 20;
  
	function RTC() {
	  //totally synchronous, for most tests
	  function keyToValue(key, cache){
	    cache.set(key, key);
	  };
		var rtc = new ReadThroughCache(keyToValue, defaultTimeToLive);
		rtc.stopExpirationTimeout();
		return rtc;
	};

  this.creation = function (){
    assert(typeof(RTC()) === "object", "Creation should return object");
  };

	this.methodsDefined = function() {
		rtc = RTC();
		methods = "get set error";
		methods.split(' ').forEach(function(e) {
			assert(typeof(rtc[e]) === "function", "ExpiringCollection should have a " + e + " function");
		});
	};
	
	this.simpleGet = function(){
	  rtc = RTC();
	  rtc.get("my_key", function(error, value){
	    assert(value === "my_key", "get should be sane!");
	  });

	};	

  this.shouldBeAbleToExpireAfterTTL = function(){
    function keyToValue(key, cache){
      setTimeout(function(){
	      cache.set(key, key);        
      }, 2 )
	  };
	  
    var rtc = new ReadThroughCache(keyToValue, defaultTimeToLive);
    rtc.set("jack", "hit the road");
    setTimeout(function(){
        assert(rtc.expiring_collection.get("jack") === undefined, "delayed expiration works");
        rtc.stopExpirationTimeout();
      },
      defaultTimeToLive * 2);
  };
};

rtct = new readThroughCacheTest();

for(i in rtct){
  rtct[i]();
}