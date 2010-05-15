I found myself re-writting the same basic JavaScript datastructures in various different projects, so I decided to store the barebones implementations here for the world.

Data Structures:

  *  The first data structure that we have is a time-expiring cache. 
  This lets you store some stuff that will automagically disappear after a while. 
  Look at expiring-collection.js for more information.
  
  *  Moving up in complexity and utility, we have a read-through-cache.
  This lets you define a cache key-to-value function and then makes sure that 
  the work to get the value for that key is only done once.
  The interface is async, so you never have to worry about cache misses.
  This supports the error, value parameter pattern that is common for node callbacks.
  Further, this is built on expiring-collection so you get timed expiration "for free"
  
  * there is a synch version of read-through-cache without expiration.
  
  * We also have an expiring queue which is like expiring collection except for a simple queue.
  
  
Dual-Licensed under the MIT and GPL (you may use it under either.)

Send me your patches and pull requests!