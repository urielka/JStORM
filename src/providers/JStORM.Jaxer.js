/*
 	Script: JStORM.Jaxer.js
          Support for Aptana Jaxer (supports an API almost identical to Google Gears)
 	
 	License:
 	        MIT-style license.
*/

/*
  Namespace: JStORM.Jaxer
  	the main namespace for Jaxer support
 */
JStORM.Jaxer = {};
/*
  Class: JStORM.Jaxer.Connection
  	represents a Jaxer connection. Override open and getLastInsertId since they are different than in
  	Google Gears
  Extends: JStORM.Gears.Connection
 */
JStORM.Jaxer.Connection = function(){};
JStORM.Jaxer.Connection.prototype = new JStORM.Gears.Connection;

JStORM.Jaxer.Connection.prototype.open = function(connParameters)
{
	if(connParameters.DIALECT == "MySQL")
		this.conn = new Jaxer.DB.MySQL.Connection(connParameters);
	else if(connParameters.DIALECT == "SQLite")
		this.conn = new Jaxer.DB.SQLite.Connection(connParameters);
	else
		throw new Error("not supported dialect")
	this.conn.open();
};

JStORM.Jaxer.Connection.prototype.getLastInsertId = function()
{
	return this.conn.lastInsertId;
};
