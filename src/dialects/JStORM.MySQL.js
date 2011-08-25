/*
 	Script: JStORM.MySQL.js
 	       support for MySQL dialect
 	License:
 	        MIT-style license.
*/
JStORM.MySQL = {};
/*
 Class: JStORM.MySQL.Introspection
 	a class that provides introspection for a connection to MySQL
 Constructor:
 Parameters:
 	connName - the connection name
 */
JStORM.MySQL.Introspection = function(connName)
{
	this.conn = JStORM.getConnection(connName);
};
JStORM.MySQL.Introspection.prototype = 
{
	/*
		Function: doesTableExist
			return true if all the tables asked for exist. Otherwise return false
		Parameters:
			a list of table names
		Returns:
			true if all the tables asked for exist, otherwise false
	 */
	doesTableExist:function()
	{
		var result = this.conn.execute("SHOW TABLES");
		var tableNames = {};
		while (result.next())
			tableNames[result.getByFieldPos(0)] = true;
			
		for(var i=0,l=arguments.length;i<l;i++)
			if(!tableNames[arguments[i].toLowerCase()])
				return false;
		return true;
	}
};

JStORM.MySQL.Sql =
{
	defaultPkSql:"INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT ",
	quote_name:function(name)
	{
		return ["`",name,"`"].join("");
	}
};
