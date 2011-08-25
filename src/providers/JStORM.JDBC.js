JStORM.JDBC = {
	/**
	* Contributed by Christopher Thatcher
	*
		Example  Connection Parameters
		{
			DRIVER 	: "org.sqlite.JDBC",
			PROVIDER:"JDBC",
			DIALECT:"SQLite",
			HOST:"jdbc:sqlite:test.db",
			NAME:"test_jdbc",
			USER:"sa",
			PASS:""
		}
	*/
};
JStORM.JDBC.Connection = function(){};

JStORM.JDBC.Connection.prototype = 
{
	execute:function(sql,params)
	{
		JStORM.log(arguments);
		var i,
		ps = this.conn.prepareStatement(sql);
		if(params&&params.length){
			for(i=0;i<params.length;i++){
				//annoying 1-based index
				ps.setObject(i+1, params[i]);
			}
		}
		return new JStORM.JDBC.ResultSet( 
			ps.executeQuery()
		);
	},
	executeNonQuery:function(sql,params)
	{
		JStORM.log(arguments);
		var i,
		ps = this.conn.prepareStatement(sql);
		if(params&&params.length){
			for(i=0;i<params.length;i++){
				//annoying 1-based index
				ps.setObject(i+1, params[i]);
			}
		} ps.executeUpdate();
	},
	executeScalar:function(sql,params)
	{
		return this.execute(sql,params).getScalar();
	},
	getLastInsertId:function() {
		return this.conn.lastInsertId||null;
	},
	open:function(connParam)
	{
		java.lang.Class.forName(connParam.DRIVER).newInstance();
		this.conn = java.sql.DriverManager.getConnection (
			connParam.HOST,
			connParam.USER,
			connParam.PASS
		);
		switch(connParam.DIALECT)
		{
			case "MySQL":
				this.getLastInsertId = function(){
					return this.executeScalar("SELECT LAST_INSERT_ID();");
				};
				break;
			case "SQLite":
				this.getLastInsertId = function(){
					return this.executeScalar("SELECT LAST_INSERT_ROWID();");
				};
				break;
			default:
				throw new Error("not supported dialect");
				break;
		}
	},
	close:function()
	{
		this.conn.close();
	},
	rollback: function()
	{
                JStORM.log("ROLLBACK");
		this.conn.rollback();	
	},
	commit: function()
	{
                JStORM.log("COMMIT");
		this.conn.commit();
	},
	begin: function()
	{
                JStORM.log("BEGIN");
		this.conn.setAutoCommit( false );
	}
};

JStORM.JDBC.ResultSet = function(resultSet)
{
	this.result = resultSet;
	this.first = resultSet.next();
	
};

JStORM.JDBC.ResultSet.prototype =
{
	next:function()
	{
		if(this.first){
			this.first = false;
			return true;
		}
		return this.result.next();
	},
	close:function()
	{
		try{
			this.result.close();
		}catch(e){}finally{
			try{this.result.getStatement().close();}catch(e){JStORM.log(e);}
		}
	},
	getByFieldName:function(fieldName)
	{
		JStORM.log(fieldName);
		return this.result.getString(fieldName);
	},
	getByFieldPos:function(fieldPos)
	{
		//darn 1-based indexes
		return this.result.getObject(fieldPos + 1);
	},
	getScalar: function()
	{	
		var ret = this.result.getObject(1);
		this.close();
		return ret;
	}
};

