/*
 	Script: JStORM.AIR.js
 	        Support for Adobe AIR
 	
 	License:
 	        MIT-style license.
*/

/*
  Namespace: JStORM.AIR
  	the main namespace for AIR support
 */
JStORM.AIR = {};
/*
 Class: JStORM.AIR.Connection
 	represents an AIR connection
 */
JStORM.AIR.Connection = function(){};
JStORM.AIR.Connection.prototype = 
{
	/*
	 Function: begin
	 	begin a transaction
	 */
	begin:function()
	{
                JStORM.log("BEGIN");
		this.conn.begin();
	},
	/*
	 Function: commit
	 	commit a transaction
	 */
	commit:function()
	{
                JStORM.log("COMMIT");
		this.conn.commit();
	},
	/*
	 Function: rollback
	 	rollback a transaction
	 */
	rollback:function()
	{
                JStORM.log("ROLLBACK");
		this.conn.rollback();
	},
	/*
	 Function: execute
	 	execute a sql statment
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 Returns:
	 	a JStORM.AIR.ResultSet for the query
	 */
	execute:function(sql,params)
	{
		JStORM.log(arguments);
		var stmt = this._getStatment(sql,params);
		stmt.execute();
		return new JStORM.AIR.ResultSet(stmt.getResult());
	},
	/*
	 Function: executeNonQuery
	 	execute a sql statment without returning
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 */
	executeNonQuery:function(sql,params)
	{
		JStORM.log(arguments);
		var stmt = this._getStatment(sql,params);
		stmt.execute();
	},
	/*
	 Function: executeScalar
	 	execute a sql statment and return the scalar value returned by query(i.e. the first column 
	 	of the first row)
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 Returns:
	 	the scalar value(first column of first row)
	 */
	executeScalar:function(sql,params)
	{
		return this.execute(sql,params).getScalar();
	},
	/*
	 Function: getLastInsertId
	 	return the id of the last inserted row
	 Returns:
	 	the id of the last inserted row
	 */
	getLastInsertId:function()
	{
		return this.conn.lastInsertRowID;
	},
	/*
	 Function: open
	 	open the connection
	 Parameters:
	 	connParam - the connection options, an object with a property PATH which is the database name
	 */
	open:function(connParam)
	{
		this.conn = new air.SQLConnection();
		this.conn.open(air.File.applicationStorageDirectory.resolvePath(connParam.PATH));
	},
	close:function()
	{
		this.conn.close();
	},
	/*
	 Function: close
	 	close the connections
	 */
	_getStatment:function(sql,params)
	{
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.conn;
		stmt.text = sql;
		if(params)
			for(var i=0,l=params.length;i<l;i++)
				stmt.parameters[i] = params[i];
				
		return stmt;
	}
};
/*
 Class: JStORM.AIR.ResultSet
 	represents an Adobe AIR result set
 Constructor:
 Parameters:
 	resulSet - the Adobe AIR result set
 */
JStORM.AIR.ResultSet = function(resultSet)
{
	this.result = resultSet;
	this.resultPointer = -1;
	this.resultLength = resultSet.data ? resultSet.data.length : 0;
};

JStORM.AIR.ResultSet.prototype =
{
	/*
	 Function: next
	 	advance to the next row and return true if there is one to read
	 Returns:
	 	true if there is a row to read
	 */
	next:function()
	{
		return ++this.resultPointer < this.resultLength;
	},
	/*
	 Function: close
	 	close the result set
	 */
	close:function()
	{
		this.result = this.resultPointer = this.resultLength = null;
	},
	/*
	 Function: getByFieldName
	 	return the field value by its name
	 Parameters:
	 	fieldName - the name of the field
	 Returns:
	 	the field value
	 */
	getByFieldName:function(fieldName)
	{
		return this.result.data[this.resultPointer][fieldName];
	},
	/*
	 Function: getByFieldPos
	 	return the field value by its position
	 Parameters:
	 	fieldPos - the position of the field
	 Returns:
	 	the field value
	 */
	getByFieldPos:function(fieldPos)
	{
		var i = 0,row = this.result.data[this.resultPointer];
		for(var columnName in row)
			if(i++ == fieldPos)
				return row[columnName];
		return null;
	},
	/*
	 Function: getScalar
	 	return the scalar value of the result set	 
	 Returns:
	 	the first column of the first row
	 */
	getScalar:function()
	{
		return this.next() ? this.getByFieldPos(0) : null;
	}
};
