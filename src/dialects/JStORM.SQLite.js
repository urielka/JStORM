/*
 	Script: JStORM.SQLite.js
 	        support for SQLite dialect 
 	
 	License:
 	        MIT-style license.
*/
JStORM.SQLite = {};
/*
 Class: JStORM.SQLite.Introspection
 	a class that provides introspection for a connection to SQLite
 Constructor:
 Parameters:
 	connName - the connection name
 */
JStORM.SQLite.Introspection = function(connName)
{
	this.sqliteMasterModel = new JStORM.Model({
		name:"sqlite_master",
		fields:
		{
			type:new JStORM.Field({type:"String"}),
			name:new JStORM.Field({type:"String"}),
			tbl_name:new JStORM.Field({type:"String"}),
			rootpage:new JStORM.Field({type:"Integer"}),
			sql:new JStORM.Field({type:"String"})
		},
		connection:connName
	});
	
	//HACK:AIR has a bug that there is no sqlite_master table!
	if(JStORM.getConnectionParams(connName).PROVIDER == "AIR")
	{
		this.conn = this.sqliteMasterModel.getConnection();
		this.doesTableExist = this._doesTableExistAirHack;
	}
};
JStORM.SQLite.Introspection.prototype = 
{
	/*
		Function: doesTableExist
			return true if all the tables asked exist. Otherwise return false
		Parameters:
			a list of table names
		Returns:
			true if all the tables asked exist, otherwise false
	 */
	doesTableExist:function()
	{
		var argsLength = arguments.length;
		var qmarks = [];
		//used instead of ["table"].concat(arguments) since it doesn`t work as expected
		var vals = ["table"];
		for(var i=0;i<argsLength;i++)
		{
			qmarks.push("?");
			vals.push(arguments[i]);	
		}
		var query = ["sqlite_master.type =? AND sqlite_master.name IN (",qmarks.join(","),")"].join("");
		vals = [query].concat(vals);
		return this.sqliteMasterModel.filter.apply(this.sqliteMasterModel,vals).count() == argsLength;
	},
	_doesTableExistAirHack:function()
	{
		try
		{
			this.conn.conn.loadSchema(air.SQLTableSchema);
		}
		//this happens when there are no tables in the database
		catch(e)
		{
			return false;
		}
		var tables = this.conn.conn.getSchemaResult().tables;
		var tableNames = {};
		tables.forEach(function(table)
		{
			tableNames[table.name] = true;
		});
		
		for(var i=0,l=arguments.length;i<l;i++)
			if(!tableNames[arguments[i]])
				return false;
		return true;
	}
};

JStORM.SQLite.Sql =
{
	defaultPkSql:"INTEGER NOT NULL PRIMARY KEY ",
	quote_name:function(name)
	{
		return ["[",name,"]"].join("");
	}
};
