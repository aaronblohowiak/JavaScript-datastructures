//Members of this collection expire at the same rate.
//  this makes our expire function simple and fast.
//  Time to Live is nerd-speak for lifespan;
//    how much time we let something be cached before cleanup
//
// Use is trivial:
//  myCollection = new ExpiringCollection(timeToLive, options = {});
//  myCollection.set(key, value);
//  myCollection.get(key);
//
//  for manual expiration, a convienence function exists:
//    myCollection.expire(key);
//
//  options is an object that may contain the following:
//    sweepFrequency (default:  Math.min(100, timeToLive / 2); )
//


var ExpiringCollection = function(timeToLive, options){
  //we are going to create an object that is the collection
  //  and also kick off the expiration function
  if(options){}else{ options = {};}
  
  this.cache = {};
  this.expirations = [];
  
  //a map of our cache keys to our expiration indicies for premuture expire
  //  and for overwriting
  this.keysExpirations = {};
  
  this.ttl = timeToLive;
  this.lastSweep = (new Date).getTime();
  if(typeof(options["sweepFrequency"]) === "number"){
    this.sweepFrequency = options["sweepFrequency"];
  }else{
    this.sweepFrequency = Math.min(100, (this.ttl / 2));
  }
    
  this.startExpirationTimeout();
  
  return this;
};

ExpiringCollection.prototype = {
  get: function(key){
    return this.cache[key];
  },
  
  set: function(key, value){
    now = (new Date).getTime();
    this.cache[key] = value;
    
    //clear any old expirations for this key
    //  and then create a new one, and cache its index
    this.nullifyExpiration(key);
    var expires = now + this.ttl;
    this.expirations.push([expires, key]);
    this.keysExpirations[key] = this.expirations.length - 1;
    
    return this;
  },

  expire: function(key){
    this.cache[key] = undefined;
    this.nullifyExpiration(key);
  },
  
  nullifyExpiration: function(key){
    //set the key of the old expiration to null
    //  we'll check for null keys when we sweep.
    if(typeof(this.keysExpirations[key]) === "number"){
      var expiration = this.expirations[this.keysExpirations[key]];
      expiration[1] = null; 
    }
  },
  
  sweep: function(){
    var cutoffTime = (this.lastSweep + this.ttl);
    var expiration = [];
    var key = null;
    
    for (var i = this.expirations.length - 1; i >= 0; i--){
      //if we have reached fresh data, stop the sweep
      expiration = this.expirations[i];
      if(expiration[0] > cutoffTime){ break; }
      key = expiration[1];
      if(key){ this.expire(key); }
    };    
  },
  
  startExpirationTimeout: function(){
    self = this;
    function mySweep(){
      self.sweep();
      self.timeout = setTimeout(mySweep, self.sweepFrequency);      
    }

    mySweep();
  },
  
  stopExpirationTimeout: function(){
    clearTimeout(this.timeout);
  }
};

if(typeof(exports) === "object"){
  exports.ExpiringCollection = ExpiringCollection;
}