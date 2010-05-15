//  This is similar to expiring-collection but has queue semantics instead of hash
//
//Members of this queue expire at the same rate.
//  this makes our expire function simple and fast.
//  Time to Live is nerd-speak for lifespan;
//    how much time we let something be cached before cleanup
//
// Use is trivial:
//  myCollection = new ExpiringQueue(timeToLive, options = {});
//  myCollection.push(value);
//  myCollection.get(); //gets all items, may include stale ones
//
//  options is an object that may contain the following:
//    sweepFrequency (default:  Math.min(100, timeToLive / 2); )
//

var ExpiringQueue = function(timeToLive, options){
  //we are going to create an object that is the collection
  //  and also kick off the expiration function
  if(options){}else{ options = {};}
  
  this.cache = [];
  this.expirations = [];
  
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

ExpiringQueue.prototype = {
  get: function(key){
    return this.cache;
  },
  
  push: function(value){
    now = (new Date).getTime();
    this.cache.push(value);
    
    var expires = now + this.ttl;
    this.expirations.push(expires);    
    return this;
  },
  
  sweep: function(){
    var cutoffTime = (this.lastSweep + this.ttl);
    var expiration = [];
    
    var length = this.expirations.length;
    var i = 0;
    //scan until i is the index of the first valid member.
    for (i; i < length; i++){
      //if we have reached fresh data, stop the sweep
      if(this.expirations[i] > cutoffTime){ break; }
    };
    
    //if we have only fresh data, dont do anything.
    if(i === 0){ return; }
    
    
    //if we have stale data, then splice away!
    this.cache.splice(0, i);
    this.expirations.splice(0, i);
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
  exports.ExpiringQueue = ExpiringQueue;
}