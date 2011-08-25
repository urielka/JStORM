/*
 	Script: JStORM.ModelMetaData.js
 	        contains a class used to describe a model's metadata 
 	
 	License:
 	        MIT-style license.
*/
/*
 Class: JStORM.ModelMetaData
 	represents a field in a model
 Constructor:
 Parameters:
 	modelClass - the class of the model
 	options - options of the model:
 		name - the name of the model
 		connection - the name of the connection
 		fields - the fields of the model
 */
JStORM.ModelMetaData = function(modelClass,options)
{
	this.modelClass = modelClass;
	this.tableName = options.name;
	this.connName = options.connection;
	this.dialect = JStORM[JStORM.getConnectionParams(this.connName).DIALECT].Sql;
	this.fields = [];
	this.relations = [];
	//go over field
	for(var fieldName in options.fields)
	{
		var field = options.fields[fieldName];
		field.fieldName = fieldName;
		field.columnName = field.columnName ? field.columnName : fieldName;
		field.sqlType = field.getSqlType();
		if(field.isPrimaryKey)
		{
			this.pk = field;
		}
		else
		{
			if(field.isRelation)
				this.relations.push(field);
			else
				this.fields.push(field);
		}
	}
	//if there is no primary key, add rowid
	if(!this.pk)
	{
		this.pk = new JStORM.Field({columnName:"rowid",isPrimaryKey:true,type:"Integer"});
		this.pk.fieldName = "rowid";
		this.pk.sqlType = this.dialect.defaultPkSql;	
	}
};

