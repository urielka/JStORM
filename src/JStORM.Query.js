/*
 	Script: JStORM.Query.js
 	        contains a class used to query over models
 	
 	License:
 	        MIT-style license.
*/

/*
  Class: JStORM.Query
  	a class used to query over models
  Constructor:
  Parameters:
  	modelClass - the class of the model
 */

JStORM.Query = function(modelClass)
{
	this.modelClass = modelClass;
	this._meta = modelClass._meta;
	this._sql = modelClass._sql;
	this._whereClause = [];
	this._orderBy = [];
	this._params = [];
	this._limit = 0;
	this._offset = 0;
	this._result = null;
};

JStORM.Query.prototype = 
{
	/*
	 Function: filter
	 	return a new Query instance filtered by whereClause
	 Parameters:
	 	whereClause - a sql where clause
	 Returns:
	 	a new Query instance filtered by whereClause
	 */
	filter:function(whereClause)
	{
		var clone = this._clone();
		clone._whereClause.push("("+whereClause+")");
		this._extendArrayFromArg(clone._params,arguments,1);
		return clone;
	},
	/*
	 Function: orderBy
	 	return a new Query ordered by columns
	 Parameters:
	 	a list of columns to order by
	 Returns:
	 	a new Query ordered by columns
	 */
	orderBy:function()
	{
		var clone = this._clone();
		this._extendArrayFromArg(clone._orderBy,arguments);
		return clone;
	},
	/*
	 Function: orderBy
	 	return a new Query limited to return n rows
	 Parameters:
	 	limit - how many rows to be returned 
	 Returns:
	 	a new Query limited to return n rows
	 */
	limit:function(limit)
	{
		var clone = this._clone();
		clone._limit = limit;
		return clone;
	},
	/*
	 Function: offset
	 	return a new Query with a row offset of n rows
	 Parameters:
	 	offset - the row offset 
	 Returns:
	 	a new Query with a row offset of n rows
	 */
	offset:function(offset)
	{
		var clone = this._clone();
		clone._offset = offset;
		return clone;
	},
	/*selectRelated:function()
	{
		
		
	},*/
	/*
	 Function: count
	 	return the number of rows that match the query
	 Parameters:
	 Returns:
	 	the number of rows that match the query
	 */
	count:function()
	{
		return this._executeScalar(this._sql.getCountSql(this._whereClause));
	},
	/*
	 Function: remove
	 	remove all the rows that match the query
	*/
	remove:function()
	{
		this._executeNonQuery(this._sql.getDeleteSql(this._whereClause));
	},
	/*
	 	Function: first
	 		return the first row as instance of the model class
	 	Returns:
	 		the first row as instance of the model class
	 */
	first:function()
	{
		var first = this.next();
		this.close();
		return first;
	},
	/*
	 Function: next
	 	return the next row as instance of the model class
	 Returns:
	 	the next row as instance of the model class
	*/	 
	next:function()
	{
		if(!this._result)
		{
			//execute the query
			this._result = this._execute(this._sql.getSelectSql(
				this._whereClause,this._orderBy,this._limit,this._offset
			));
		}
		
		if (this._result.next())
			return this.modelClass._newFromResultSet(this._result,this._meta.tableName);
		else {
			this.close();
			return false;
		}
	},
	/*
	 Function: close
	 	close the inner result set
	 */
	close:function()
	{
		if (this._result)
		{
			this._result.close();
			//make result null if we want to run the query again
			this._result = null;
		}
	},
	/*
	 Function: each
	 	apply fn on each row (as a model instance) returned by query
	 Parameters:
	 	fn - function to apply on each row
	 	bind - the binding for the function
	 */
	each:function(fn,bind)
	{
		var current;
		while(current = this.next())fn.apply(bind || this,[current]);
	},
	/*
	 Function: toArray
	 	return the rows returned by the query as a array of model instances
	 Returns:
	 	the rows returned by the query as a array of model instances
	 */
	toArray:function()
	{
		var arr = [];
		this.each(arr.push,arr);
		return arr;
	},
	///////////////////////////////////
	/// private functions          ///
	/////////////////////////////////
	_getConnection:function()
	{
		return this.modelClass.getConnection()
	},
	_execute:function(sql)
	{
		return this._getConnection().execute(sql,this._getParams());
	},
	_executeScalar:function(sql)
	{
		return this._getConnection().executeScalar(sql,this._getParams());
	},
	_executeNonQuery:function(sql)
	{
		return this._getConnection().executeNonQuery(sql,this._getParams());
	},
	_extendArrayFromArg:function(arr,args,offset)
	{
		arr.push.apply(arr,Array.prototype.slice.apply(args,[offset ? offset : 0]));
	},
	_getParams:function()
	{
		var params = [];
		for(var i=0,l=this._params.length;i<l;i++)
			params.push(typeof(this._params[i]) == "function" ? this._params[i]() : this._params[i]);
		return params;
	},
	_clone:function()
	{
		var clone = new JStORM.Query(this.modelClass);
		clone._whereClause = this._whereClause; 
		clone._orderBy = this._orderBy;
		clone._params = this._params;
		clone._limit = this._limit;
		clone._offset = this._offset;
		return clone;
	}
};
/*
  Class: JStORM.ManyToManyQuery
        a class used to query over Many to Many relations
  Constructor:
  Parameters:
        m2mClass - class representing the m2m relation
        nameOfSelf - name of the left side of the relation(the one that have this object)
        nameOfRelated - name of the right side of the relation
        getPkFunc - a function to get the pk value of the left side relation
 */

JStORM.ManyToManyQuery = function(m2mClass,nameOfSelf,nameOfRelated,getPkFunc)
{
    this.getPkFunc = getPkFunc;
    this.nameOfRelated = nameOfRelated;
    this.nameOfSelf = nameOfSelf;
    JStORM.Query.call(this,m2mClass);
};

//inherit from JStORM.Query
JStORM.extend(JStORM.ManyToManyQuery.prototype,JStORM.Query.prototype);
//new methods for M2M relations
JStORM.extend(JStORM.ManyToManyQuery.prototype,{
    /*
        Function: add
            relate item with this object
        Parameters:
            item - the item to add to the relation
    */
    add:function(item)
    {
        var relation = new this.modelClass();
        relation[this.nameOfRelated] = item;
        relation[this.nameOfSelf] = this.getPkFunc();
        relation.save();
    },
    /*
        Function: add
            unrelate item with this object or if no item supplied remove all objects that match the query
        Parameters:
            item - the item to remove from the relation
    */
    remove:function(item)
    {
        if(item)
        {
            var pkOfItem = typeof(valuesOrRowID) == "number" ? item : item.getPkValue();
            this.filter(this.nameOfRelated + " = ?",pkOfItem).remove();
        }
        else
        {
            JStORM.Query.prototype.remove.call(this);
        }
    },
    next:function()
    {
        var next = JStORM.Query.prototype.next.call(this);
        if(next)
            return next[this.nameOfRelated];
        return next;
    },
    _clone:function()
    {
            var clone = new JStORM.ManyToManyQuery(this.modelClass,this.nameOfSelf,this.nameOfRelated,this.getPkFunc);
            clone._whereClause = this._whereClause; 
            clone._orderBy = this._orderBy;
            clone._params = this._params;
            clone._limit = this._limit;
            clone._offset = this._offset;
            return clone;
    }
});