/*
 	Script: JStORM.ASP.js
 	        Support for ASP/ADO/Sql Server/Access
 	License:
 	        MIT-style license.
*/

/*
  Namespace: JStORM.ASP
  	the main namespace for ASP support
 */
JStORM.ASP = {};

/*
 Class: JStORM.ASP.Connection
 	represent an ASP ADO connection
 */
JStORM.ASP.Connection = function () {};
JStORM.ASP.Connection.prototype =
{
	/*
	 Function: begin
	 begin a transaction
	 */
	begin: function()
	{
		this.execute(JStORM[this.dialect].Sql.beginTransactionSql);
	},
	/*
	 Function: commit
	 commit a transaction
	 */
	commit: function()
	{
		this.execute("COMMIT");
	},
	/*
	 Function: rollback
	 rollback a transaction
	 */
	rollback: function()
	{
		this.execute("ROLLBACK");
	},
	/*
	 Function: execute
	 	execute a sql statment
	 Parameters:
	 	sql - sql statment
	 	params - bind parameters
	 Returns:
	 	a JStORM.ASP.ResultSet for the query
	 */
	execute:function (sql, params)
	{
		sql = this._applyParams(sql,params);
		JStORM.log(sql);
		return new JStORM.ASP.ResultSet(this.conn.execute(sql));
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
	executeScalar:function (sql,params)
	{
		var sql = this._applyParams(sql, params);
		JStORM.log(sql);
		return new JStORM.ASP.ResultSet(this.conn.execute(sql)).getScalar();
	},
	/*
	 Function: getLastInsertId
	 	return the id of the last inserted row
	 Returns:
	 	the id of the last inserted row
	 */
	getLastInsertId:function()
	{
		return this.conn.execute(
			JStORM[this.dialect].Sql.getLastInsertIdSql
		).fields(0).value || 0;
	},
	open:function(params)
	{
		params = params || {};
		this.dialect = params.DIALECT;
		this.conn = new ActiveXObject("ADODB.Connection");
		
		switch (params.DIALECT)
		{
		  case "Access" :
		  	var fso = new ActiveXObject("Scripting.FileSystemObject");
			if(!fso.fileExists(params.PATH))
			{
				var catalog = new ActiveXObject("ADOX.Catalog");
		  		catalog.create("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" +  params.PATH);
			}
			this.conn.provider = "Microsoft.Jet.OLEDB.4.0"
			this.conn.open(params.PATH);
			break;
		  case "SQLServer" :
			var connString = "Provider=SQLOLEDB" + 
			  ";Server=" + params.HOST + 
			  ";Database=" + params.NAME + 
			  ";User Id=" + params.USER + 
			  ";Password=" + params.PASS;
			this.conn.open(connString);
			break;
		  default : 
		    throw new Error("Unsupported dialect");
		    break;
		}
	},
	close:function()
	{
		this.conn.close();
	},
	/*
	 Function: _applyParams
	 	SQL Server parameter replacement is very painful, so define a
	 	private function that does it here.
	 Private:
	 Returns:
	 	A sql query with replaced parameters
	 */
	_applyParams: function(sql, params){
		params = params || [];
		var newSql = [];
		var parts = [];
		
		// Replace all ' with '' in strings just to be safe, and quote, too
		for (var i = 0; i < params.length; i += 1)
		{
			if (typeof params[i] === "string")
				params[i] = "'" + params[i].replace(/\'/g, "''") + "'";
			else if (params[i] === null)// Send a string for nulls
				params[i] = "NULL";
		}
		
		parts = sql.split("?"); // Split the query into parts
		// If there are not enough parameters, throw an error, if there are too many,
		// ignore the extras
		if ((params.length + 1) < parts.length)
			throw new Error("SQL parameter mismatch");
		
		for (var i = 0; i < parts.length; i += 1) 
			newSql.push(parts[i], params[i]);
		
		return newSql.join("");
	}
};

// Gears is OK if you close the connection on the query object, not so with ADO.
JStORM.ASP.Connection.prototype.executeNonQuery = JStORM.ASP.Connection.prototype.execute;


/*
 Class: JStORM.ASP.ResultSet
 	represent an ASP result set (not the same as an ADO Recordset, and more 
  	similar to a Google Gears ResultSet
 Constructor:
 Parameters:
 	resulSet - the ASP result set
 */
JStORM.ASP.ResultSet = function(resultSet)
{
	this.result = resultSet;
	this.first = true;
};
JStORM.ASP.ResultSet.prototype =
{
	/*
	 Function: next
	 	advance to the next row and return true if there is one to read
	 Returns:
	 	true if there is a row to read
	 */
	next:function()
	{
		if (this.first)
			this.first = false;
		else
			this.result.moveNext();
		
		return this.isValidRow();
	},
	/*
	 Function: close
	 	close the result set
	 */
	close:function()
	{
		if(this.result.close)
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
		return this.result.fields(fieldName).value || false;
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
		return this.result.fields(fieldPos).value;
	},
	/*
	 Function: getScalar
	 	return the scalar value of the result set	 
	 Returns:
	 	the first column of the first row
	 */
	getScalar:function()
	{
		var ret = this.isValidRow() ? this.result.fields(0).value : null;
		this.close();
		return ret;
	},
	/*
	 Function : isValidRow
	  is the row valid?
	*/
	isValidRow:function()
	{
	  return !(this.result.eof || this.result.bof);
	}	
};
