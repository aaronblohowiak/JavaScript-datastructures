var ExpiringQueue = require("../expiring-queue").ExpiringQueue,
	sys = require("sys"),
	p = sys.puts;

var assert = function(cond, stmt) {
	if (cond) {
		p("PASS: " + stmt);
	} else {
		p("FAIL: " + stmt);
	}
};

var ExpiringQueueTest = function() {
  var defaultTimeToLive = 20;
  
	function anEQ() {
		var eq = new ExpiringQueue(defaultTimeToLive);
		eq.stopExpirationTimeout();
		return eq;
	};

  this.creation = function (){
    assert(typeof(anEQ()) === "object", "Creation should return objeqt");
  };

	this.methodsDefined = function() {
		eq = anEQ();
		methods = "get push stopExpirationTimeout";
		methods.split(' ').forEach(function(e) {
			assert(typeof(eq[e]) === "function", "ExpiringQueue should have a " + e + " function");
		});
	};
	
	
  this.shouldBeAbleToExpireAfterTTL = function(){
    eq = new ExpiringQueue(defaultTimeToLive);
    eq.push("jack")
    eq.push("hit the road");
    eq.push("hit the road");
    eq.push("hit the road");
    assert(eq.get().length === 4, "multi-push works");
    
    setTimeout(function(){
        assert(eq.get().length === 0, "delayed expiration works");
        eq.stopExpirationTimeout();
      },
      defaultTimeToLive * 2);
  };
};

eqt = new ExpiringQueueTest();

for(i in eqt){
  eqt[i]();
}