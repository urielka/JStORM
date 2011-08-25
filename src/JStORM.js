/*
 	Script: JStORM.js
 	        Contains the main namespace for JStORM and connection/model management
 	
 	License:
 	        MIT-style license.
*/

/*
  Class: JStORM
  	the main namespace for JStORM. Also provides connection/model management
 */
var JStORM = 
{
	/*
	 a dictionary from model name to class
	*/
	_models:{},
	_introspections:{},
	/*
	 a dictionary from connection name to options
	 */
	connections:{},
	/*
	 a dictionary holding all the open connections by name
	 */
	openConnections:{},
	/*
	 if true debug logging will be enabled
	 */
	debug:true,
	version:'0.3beta',
	/*
	 Function: getConnectionParams
	 	return the connection options by connection name
	 Parameters:
	 	connName - connection name
	 Returns:
	 	the connection options by connection name
	 */
	getConnectionParams:function(connName)
	{
		return JStORM.connections[connName];
	},
	/*
	  Function: getConnection
	  	return a new connection by connection name
	  Parameters:
	  	connName - connection name
	  Returns:
	  	a new connection by connection name
	 */
	getConnection:function(connName)
	{
                var conn = JStORM.openConnections[connName];
                if(!conn)
                {    
                    var connParams = JStORM.getConnectionParams(connName);
                    conn = new JStORM[connParams.PROVIDER].Connection();
                    conn.open(connParams);
                    conn.transactionDepth = 0;
                    JStORM.openConnections[connName] = conn;
                }
		return conn;
	},
	/*
	  Function: getIntrospection
	  	return an introspection object for a connection by its name
	  Parameters:
	  	connName - connection name
	  Returns:
	  	an introspection object for a connection by its name
	 */
	getIntrospection:function(connName)
	{
		var connParams = JStORM.getConnectionParams(connName);
		if(!JStORM._introspections[connName])
			JStORM._introspections[connName] = new JStORM[connParams.DIALECT].Introspection(connName);
		return JStORM._introspections[connName];
	},
	/*
	 Function: closeAllConnections
	  	close all the open connections
	 */
	closeAllConnections:function()
	{
		for(var name in JStORM.openConnections)
                {
                    JStORM.openConnections[name].close();
                    delete JStORM.openConnections[name];
                }
	},
	/*
		taken from mootools
	 */
	extend:function(src, add)
	{
		if (!add)
		{
			add = src;
			src = this;
		}
		for (var property in add) src[property] = add[property];
		return src;
	},
	/*
		internal
	*/
	each:function(arr,fn)
	{
		for(var i=0,l=arr.length;i<l;i++)
			fn(arr[i]);
	}
};

/**
 * log a message with available logging module
 */
JStORM.log = (function(){
	if(JStORM.debug && typeof window === "object" && window.console && window.console.log)
		return console.log;
	else if (JStORM.debug && typeof Jaxer === "object")
	{
		return function(args)
		{
			var res = args;
			if(typeof(args) != "string" && args.length)
				var res =Array.prototype.join.apply(args,[","]);
			Jaxer.Log.info(res);
		}
	}
	else
		return function(){};	
})();
