/*
 	Script: JStORM.Gears.js
 	        Support for Google Gears
 	
 	License:
 	        MIT-style license.
*/

/*
  Namespace: JStORM.Gears
  	the main namespace for Gears support
 */
JStORM.Gears = {};
/*
 Class: JStORM.Gears.Connection
 	represent a Google Gears connection
 */
JStORM.Gears.Connection = function(){};
JStORM.Gears.Connection.prototype = 
{
	/*
	 Function: begin
	 	begin a transaction
	 */
	begin:function()
	{
		this.executeNonQuery("BEGIN");
	},
	/*
	 Function: commit
	 	commit a transaction
	 */
	commit:function()
	{
		this.executeNonQuery("COMMIT");
	},
	/*
	 Function: rollback
	 	rollback a transaction
	 */
	rollback:function()
	{
		this.executeNonQuery("ROLLBACK");
	},
	/*
	 Function: execute
	 	execute a sql statment
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 Returns:
	 	a JStORM.Gears.ResultSet for the query
	 */
	execute:function(sql,params)
	{
		JStORM.log(arguments);
		if(params)//needed for jaxer
			return new JStORM.Gears.ResultSet(this.conn.execute(sql,params));
		else
			return new JStORM.Gears.ResultSet(this.conn.execute(sql));
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
		if(params)//needed for jaxer
			new JStORM.Gears.ResultSet(this.conn.execute(sql,params)).close();
		else
			new JStORM.Gears.ResultSet(this.conn.execute(sql)).close();	
	},
	/*
	 Function: executeScalar
	 	execute a sql statment and return the scalar value returned by query (i.e., the first column 
	 	of the first row)
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 Returns:
	 	the scalar value (first column of first row)
	 */
	executeScalar:function(sql,params)
	{
		JStORM.log(arguments);
		return new JStORM.Gears.ResultSet(this.conn.execute(sql,params)).getScalar();
	},
	/*
	 Function: getLastInsertId
	 	return the id of the last inserted row
	 Returns:
	 	the id of the last inserted row
	 */
	getLastInsertId:function()
	{
		return this.conn.lastInsertRowId;
	},
	/*
	 Function: open
	 	open the connection
	 Parameters:
	 	connParam - the connection options: an object with a property HOST which is the database name
	 */
	open:function(connParam)
	{
		this.conn = google.gears.factory.create('beta.database');
		this.conn.open(connParam.HOST);
	},
	/*
	 Function: close
	 	close the connections
	 */
	close:function()
	{
		this.conn.close();
	}
};

/*
 Class: JStORM.Gears.ResultSet
 	represent a Google Gears result set
 Constructor:
 Parameters:
 	resulSet - the Google Gears result set
 */
JStORM.Gears.ResultSet = function(resultSet)
{
	this.result = resultSet;
	this.first = true;
};
JStORM.Gears.ResultSet.prototype =
{
	/*
	 Function: next
	 	advance to the next row and return true if there is one to read
	 Returns:
	 	true if there is a row to read
	 */
	next:function()
	{
		if(this.first)
			this.first = false;
		else
			this.result.next();
			
		return this.result.isValidRow();
	},
	/*
	 Function: close
	 	close the result set
	 */
	close:function()
	{
		if("close" in this.result)
			this.result.close();
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
		return this.result.fieldByName(fieldName);
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
		return this.result.field(fieldPos);
	},
	/*
	 Function: getScalar
	 	return the scalar value of the result set	 
	 Returns:
	 	the first column of the first row
	 */
	getScalar:function()
	{
		var ret = this.result.isValidRow() ? this.result.field(0) : null;
		this.close();
		return ret;
	}
};
