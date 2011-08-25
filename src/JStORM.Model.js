/*
 	Script: JStORM.Model.js
 	        Contains the JStORM.Model meta-class used to describe a model
 	
 	License:
 	        MIT-style license.
*/

/*
 	Class: JStORM.Model
  		a meta-class used to describe a model
  	Constructor:
  	Parameters:
  		options - a dictionary of the following:
  			name - name of the model
  			connection - name of the connection
  			fields - a dictionary between field names and instances of JStORM.Field
*/
JStORM.Model = function(options)
{
	if(!options || !options.name || !options.fields || !options.connection)
		throw new Error("no name/fields/connection were supplied");
	/*
	 Class: JStORM.Model.model
	 	this is the class of each model, created by the meta-class
	 Constructor:
	 Parameters:
	 	valuesOrRowID - either the id of a row in the table to retrieve or 
	 	an object to populate the new instance
	*/
	var model = function(valuesOrRowID)
	{
		var instance = this;
                instance.modelClass = model;
		if(valuesOrRowID)
		{
			if(typeof(valuesOrRowID) == "number")
			{
				this.setPkValue(valuesOrRowID);
				this.refresh();
				return;
			}
			else
			{
				JStORM.extend(this,valuesOrRowID);
			}
		}

                function getPkValue()
                {
                    return instance.getPkValue()
                }

		JStORM.each(model._meta.relations,function(relation)
		{
                        var relatedModel = relation.relatedModel();
			if(relation.relationType == "ManyToOne")
				instance[relation.fieldName] = new JStORM.Query(relatedModel)
					.filter(relation.relatedColumnName + " = ?",getPkValue);

                        if(relation.relationType == "ManyToMany")
                                instance[relation.fieldName] = new JStORM.ManyToManyQuery(JStORM.Model.getM2Model(model,relatedModel),
                                                                        model._meta.tableName,relatedModel._meta.tableName,getPkValue)
                                                               .filter(model._meta.tableName + " = ?",getPkValue);
		});
	};
	
	model.prototype =
	{
		/*
		 Function: save
		 	save the instance into the database (does INSERT/UPDATE)
		 */
		save:function()
		{
			return this._updateInsert(this._isPkSet(this));
		},
		/*
		 Function: remove
		 	remove the instance from database (using DELETE)
		 */
		remove:function()
		{
			model.removeByPk(this.getPkValue());
		},
		/*
		 Function: refresh
		 	retrieve the instance from database
		 */
		refresh:function()
		{
			if(this._isPkSet())
				JStORM.extend(this,model.getByPk(this.rowid));
			return this;
		},
		/*
		 Function: getPkValue
		 	return the value of the primary key
		 Returns:
		 	the value of the primary key
		 */
		getPkValue:function()
		{
			return this[model._meta.pk.fieldName];
		},
		/*
		 Function: setPkValue
		 	set the value of the primary key
		 */
		setPkValue:function(pkValue)
		{
			this[model._meta.pk.fieldName] = pkValue;
			return this;
		},
		_isPkSet:function()
		{
			return !!this[model._meta.pk.fieldName];
		},
		_updateInsert:function(update)
		{
			var query = update ? model._sql.getUpdateSql() : model._sql.getInsertSql();

			var values = [],self = this;
			JStORM.each(model._meta.fields,function(field)
			{
				var value = self[field.fieldName];
				if(typeof(value) == "undefined")
					values.push(null);
				else
					values.push(value);
			});
			JStORM.each(model._meta.relations,function(relation)
			{
				var value = self[relation.fieldName];
				if(relation.relationType == "OneToMany")
				{
					if(typeof(value) == "number" || (!value && relation.allowNull))
						values.push(value);
					else if(value.getPkValue)
						values.push(value.getPkValue());
					else
						throw new Error("value of related model can be a model instance,or a id(integer)");
				}
			});			
			if(update)values.push(this.getPkValue());
			var conn = model.getConnection();
			conn.executeNonQuery(query,values);			
			if(!update)this.rowid = conn.getLastInsertId();
			return this;
		}
	};
	//add static methods
	JStORM.extend(model,this);
	//add events support
	JStORM.extend(model,new JStORM.Events);
	for(var i in model.prototype)//add events to save,remove,refresh
		if(i.charAt(0) != "_")//wrap only public functions
			model.prototype[i] = JStORM.Events.wrapFunction(model.prototype[i],i.charAt(0).toUpperCase()+i.substring(1),model);

	//add meta data
	model._meta = new JStORM.ModelMetaData(model,options);
	//add sql generator
	model._sql = new JStORM.Sql(model._meta);
	//add getBy and removeBy for each fields
	//for(var i=0,l = model._meta.fields.length;i<l;i++)
	//{
	//	var field = model._meta.fields[i];
	//	model["getBy" + field.fieldName] = JStORM.curry(model.getByFieldValue,model,field.fieldName);
	//	model["removeBy" + field.fieldName] = JStORM.curry(model.removeByFieldValue,model,field.fieldName);
	//}
	
	//register model
	JStORM._models[options.name] = model;
	return model;
};
JStORM.Model.prototype = {
	/*
	 Function: all
	 	return a JStORM.Query for the model without filtering
	 Returns:
	 	a JStORM.Query for the model without filtering
	 */
	all: function(){
		return new JStORM.Query(this);
	},
	/*
	 Function: filter
	 	return a JStORM.Query for the model with filtering
	 Parameters:
	 	sql - the sql whereClause
	 	params - bind parameters
	 Returns:
	 	a JStORM.Query for the model with filtering
	 */
	filter: function(sql,params){
		var query = this.all();
		return query.filter.apply(query, arguments);
	},
	/*
	 Function: remove
	 	remove all the rows that match the filter
	 Parameters:
	 	sql - the sql whereClause
	 	params - bind parameters
	 */
	remove: function(sql,params){
		var query = this.all();
		query.filter.apply(query, arguments).remove();
	},
	/*
	 Function: getByFieldValue
	 	return the first row where the fieldName = fieldValue
	 Parameters:
	 	fieldName - the name of the field
	 	fieldValue - the value of the field
	 Returns:
	 	the first row where the fieldName = fieldValue
	 */
	getByFieldValue: function(fieldName, fieldValue){
		return this.filter(this._meta.tableName + "." + fieldName + " = ?", fieldValue).first();
	},
	/*
	 Function: getByPk
	 	return the row by the primary key
	 Parameters:
	 	pkValue - value of primary key
	 Returns:
	 	the row by the primary key
	 */
	getByPk: function(pkValue){
		return this.getByFieldValue(this._meta.pk.fieldName, pkValue);
	},
	/*
	 Function: removeByFieldValue
	 	remove all rows where the fieldName = fieldValue
	 Parameters:
	 	fieldName - the name of the field
	 	fieldValue - the value of the field
	 */
	removeByFieldValue: function(fieldName, fieldValue){
		return this.filter(this._meta.tableName + "." + fieldName + " = ?", fieldValue).remove();
	},
	/*
	 Function: removeByPk
	 	remove the row by the primary key
	 Parameters:
	 	pkValue - value of primary key
	 */
	removeByPk: function(pkValue){
		this.removeByFieldValue(this._meta.pk.fieldName, pkValue);
	},
	/*
	 Function: getConnection
	 	return the connection for this model
	 Returns:
	 	the connection for this model
	 */
	getConnection: function(){
		if (!this._connection) {
			this._connection = JStORM.getConnection(this._meta.connName);
		}
		return this._connection;
	},
	/*
	 Function: dropTable
	 	drop the table that this model is abstracting
	 */
	dropTable: function(){
                var self = this;
		if(this.doesTableExist())
			this.getConnection().executeNonQuery(this._sql.getDropTableSql());
                JStORM.each(this._meta.relations,function(relation)
                {
                    var relatedModel = relation.relatedModel();
                    if(relatedModel)
                    {
                        if(relation.relationType == "ManyToMany")
                            JStORM.Model.getM2Model(relation.relatedModel(),self).dropTable();
                    }
                });
	},
	/*
	 Function: createTable
	 	create the table that this model is abstracting
	 */
	createTable: function(){
            var self = this;
            this.transaction(function(){
                if(!self.doesTableExist())
                        self.getConnection().executeNonQuery(self._sql.getCreateTableSql());
                JStORM.each(self._meta.relations,function(relation)
                {
                    if(relation.relationType == "ManyToMany")
                    {
                            var relatedModel = relation.relatedModel();
                            if(relatedModel)
                            {
                                var m2mModel = JStORM.Model.getM2Model(relatedModel,self);
                                if(!m2mModel.doesTableExist())
                                    m2mModel.createTable();
                            }
                    }
                });
            });
	},
	/*
	 Function: doesTableExist
	 	return true if the table is already created
	 */
	doesTableExist:function(){
		return JStORM.getIntrospection(this._meta.connName).doesTableExist(this._meta.tableName);
	},
	/*
	 Function: transaction
	 	run a function in a transaction
	 Parameters:
	 	fn - function to run
	 	bind - bind for the function
	 */
	transaction: function(fn, bind){
		var conn = this.getConnection();
		try {
			if (conn.transactionDepth <= 0) 
				conn.begin();
			conn.transactionDepth++;
			fn.apply(bind || this, []);
		} 
		catch (e) {
			conn.transactionDepth = 0;
			conn.rollback();
			throw e;
		}
		conn.transactionDepth = Math.max(0, conn.transactionDepth - 1);
		if (conn.transactionDepth <= 0) 
			conn.commit();
		
	},
	_newFromResultSet: function(result, relationPrefix){
		var cls = this;
		//create a new instance of the this class
		var instance = new cls();
		
		//every model has a primary key. Set the value from the result
		instance.setPkValue(result.getByFieldName(relationPrefix + "_" + this._meta.pk.columnName));
		
		JStORM.each(cls._meta.fields, function(field){
			instance[field.fieldName] = result.getByFieldName(relationPrefix + "_" + field.fieldName)
		});
		
		JStORM.each(cls._meta.relations, function(relation){
			if (relation.relationType == "OneToMany") {
				var relatedModel = relation.relatedModel();
				if (relatedModel == cls) 
					instance[relation.fieldName] = new relatedModel().setPkValue(result.getByFieldName(relationPrefix + "_" + relation.columnName));
				else 
					instance[relation.fieldName] = relatedModel._newFromResultSet(result, relationPrefix + "_" + relation.columnName)
			}
		});
		return instance;
	}
	/*
	 TODO: load,
	 */
};
/*
    Function: getM2Model
        returns a model that act as a m2m relation between relatedModel and model
    Parameters:
        relatedModel - one side of the relation
        model - other side of the relation
*/
JStORM.Model.getM2Model = function(relatedModel,model)
{
    //use the same model from both directions,sorting the names give one possible name for two tables
    var names = [relatedModel._meta.tableName,model._meta.tableName].sort();
    var modelName = "m2m_" + names.join("_");
    var m2mModel = JStORM._models[modelName];

    if(!m2mModel)
    {
        var fields = {};
        fields[names[0]] = new JStORM.Field({relatedModel:names[0],relationType:"OneToMany"});
        fields[names[1]] = new JStORM.Field({relatedModel:names[1],relationType:"OneToMany"});
        m2mModel = new JStORM.Model({
            "name":modelName,
            "fields":fields,
            "connection":model._meta.connName
        });
    }
    return m2mModel;
};