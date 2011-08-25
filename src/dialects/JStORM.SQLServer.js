/*
 	Script: JStORM.SQLServer.js
 	        support for SQL Server dialect (T-SQL)
 	License:
 	        MIT-style license.
 */
JStORM.SQLServer = {};
/*
 Class: JStORM.SQLServer.Introspection
 	a class that provides introspection for a connection to SQL Server
 Constructor:
 Parameters:
 	connName - the connection name
 */
JStORM.SQLServer.Introspection = function (connName) {
	this.sysObjects = new JStORM.Model({
		name:"sys.objects",
		fields:
		{
			objectId:new JStORM.Field({type:"Integer",isPrimaryKey:true,columnName:"object_id"}),
			name:new JStORM.Field({type:"String"}),
			type:new JStORM.Field({type:"String"}),
			parent: new JStORM.Field({
				relationType: "OneToMany",
				relatedModel: "sys.objects",
				allowNull: true,
				columName:"parent_object_id"
			})
		},
		connection:connName
	});
};
JStORM.SQLServer.Introspection.prototype =
{
	/*
		Function: doesTableExist
			return true if all the tables asked exist. Otherwise return false
		Parameters:
			a list of table names
		Returns:
			true if all the tables asked exist, otherwise false
	 */
	doesTableExist : function ()
	{
    	var argsLength = arguments.length;
		var qmarks = [];
		//U is for User table
		var vals = ["U"];
		for(var i=0;i<argsLength;i++)
		{
			qmarks.push("?");
			vals.push(arguments[i]);	
		}
		var query = ["type = ? AND name IN (",qmarks.join(","),")"].join("");
		vals = [query].concat(vals);
		return this.sysObjects.filter.apply(this.sysObjects,vals).count() == argsLength;
 	}
};

JStORM.SQLServer.Sql =
{
	beginTransactionSql : "BEGIN TRANSACTION ",
	defaultPkSql : "INTEGER NOT NULL IDENTITY ",
	getLastInsertIdSql : "SELECT @@IDENTITY ",
	quote_name:function(name)
	{
		return ["[",name,"]"].join("");
	}
};

