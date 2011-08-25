/*
 	Script: JStORM.Access.js
 	        support for Access dialect
 	License:
 	        MIT-style license.
 */

JStORM.Access = {};
/*
 Class: JStORM.Access.Introspection
 	a class that provides introspection for a connection to Access
 Constructor:
 Parameters:
 	connName - the connection name
 */
JStORM.Access.Introspection = function (connName)
{
	this.connectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + JStORM.getConnectionParams(connName).PATH;	
};

JStORM.Access.Introspection.prototype =
{
	/*
		Function: doesTableExist
			return true if all the tables asked for exist. Otherwise return false
		Parameters:
			a list of table names
		Returns:
			true if all the tables asked for exist, otherwise false
	 */
	doesTableExist: function()
	{
		var catalog = new ActiveXObject("ADOX.Catalog");
		catalog.ActiveConnection = this.connectionString;
		tableNames = {};
		for (var i = 0, l = catalog.Tables.Count; i < l; i++) 
			tableNames[catalog.Tables(i).Name] = true;
		
		for (var i = 0, l = arguments.length; i < l; i++) 
			if (!tableNames[arguments[i]]) 
				return false;
		
		return true;
	}
};
//Access dialect is very similar to SQL Server
JStORM.Access.Sql = JStORM.SQLServer.Sql
