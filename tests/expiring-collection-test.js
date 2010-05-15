var ExpiringCollection = require("../expiring-collection").ExpiringCollection,
	sys = require("sys"),
	p = sys.puts;

var assert = function(cond, stmt) {
	if (cond) {
		p("PASS: " + stmt);
	} else {
		p("FAIL: " + stmt);
	}
};

var expiringCollectionTest = function() {
  var defaultTimeToLive = 20;
  
	function anEC() {
		var ec = new ExpiringCollection(defaultTimeToLive);
		ec.stopExpirationTimeout();
		return ec;
	};

  this.creation = function (){
    assert(typeof(anEC()) === "object", "Creation should return object");
  };

	this.methodsDefined = function() {
		ec = anEC();
		methods = "get set expire";
		methods.split(' ').forEach(function(e) {
			assert(typeof(ec[e]) === "function", "ExpiringCollection should have a " + e + " function");
		});
	};
	
	this.simpleSetAndGet = function(){
	  ec = anEC();
	  ec.set("my_key", 1337);
	  assert((ec.get("my_key") === 1337), "set and get should be sane!");
	};
	
	this.shouldBeAbleToExpireImmediately = function(){
	  ec = anEC();
    ec.set("now", "you see it");
    ec.expire("now"); //you dont!
    assert(ec.get("now") === undefined, "immediate expiration works");
	};
	
  this.shouldBeAbleToExpireAfterTTL = function(){
    ec = new ExpiringCollection(defaultTimeToLive);
    ec.set("jack", "hit the road");
    setTimeout(function(){
        assert(ec.get("jack") === undefined, "delayed expiration works");
        ec.stopExpirationTimeout();
      },
      defaultTimeToLive * 2);
  };
};

ect = new expiringCollectionTest();

for(i in ect){
  ect[i]();
}