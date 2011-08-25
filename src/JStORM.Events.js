/*
 	Script: JStORM.Events.js
 	        Contains a event manager for JStORM
 	
 	License:
 	        MIT-style license.
*/
/*
 Class: JStORM.Events
 	a simple event manager
 Constructor:
 */
JStORM.Events = function()
{
	this.$events = {};
}
JStORM.Events.prototype = 
{
	/*
	 Function: addListener
	 	add an event listener
	 Parameters:
	 	name - the name of the event
	 	fn - callback function
	 */
	addListener:function(name,fn)
	{
		this.$events[name] = this.$events[name] || [];
		this.$events[name].push(fn);
		return this;	
	},
	/*
	 Function: removeListener
	 	remove an event listener
	 Parameters:
	 	name - the name of the event
	 	fn - callback function
	 */
	removeListener:function(name,fn)
	{
		if(this.$events[name])
			this.$events[name].remove(fn);
		return this;
	},
	/*
	 Function: fireEvent
	 	fire an event
	 Parameters:
	 	name - the name of the event
	 	args - arguments for event listeners
	 	bind - binding for event listeners
	 */
	fireEvent:function(name,args,bind)
	{
		var listeners = this.$events[name];
		if(listeners)
			for(var i=0,ln=listeners.length;i<ln;i++)
				listeners[i].apply(bind || this,args || [])
		return this;
	}
};

/*
  Function: wrapFunction
  	wrap a function with a onBefore/onAfter events
  Parametrs:
  	fn - function to wrap
  	name - name of the event
  	object - the event manager
  Returns:
  	a wrapped function
 */
JStORM.Events.wrapFunction=function(fn,name,object)
{
	return function()
	{
		object.fireEvent("onBefore"+name,[this]);
		var ret = fn.apply(this,arguments);
		object.fireEvent("onAfter"+name,[this]);
		return ret;
	};
};
