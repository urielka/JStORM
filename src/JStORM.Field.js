/*
 	Script: JStORM.Field.js
 	        contains a class used to describe a field in a model 
 	
 	License:
 	        MIT-style license.
*/

/*
 Class: JStORM.Gears.ResultSet
 	represent a field in a model
 Constructor:
 Parameters:
 	options - options of a field:
 		columnName - name of the column in the database
 		relatedColumnName - name of the column in the related model (if this is a relation)
 		relationType - either ManyToOne or OneToMany
 		type - type of the field
    maxLength - max length of the field (apply to String only)
 		isPrimaryKey - is this field a primary key?
 		allowNull - true to enable null values in this field
 */
JStORM.Field = function(options)
{
	this.columnName = options.columnName;
	this.relatedColumnName = options.relatedColumnName;
	this.relatedModel = function()
	{
		return JStORM._models[options.relatedModel];
	};
	this.relationType = options.relationType;
	this.isRelation = !!this.relationType;
	this.type = this.isRelation ? "Integer" : options.type;
	this.maxLength = options.maxLength;
	this.isPrimaryKey = options.isPrimaryKey;
	this.allowNull = options.allowNull;
};

JStORM.Field.prototype.getSqlType = function()
{
	 
	return JStORM.Field.TypeToSql[this.type](this);
};

JStORM.Field.TypeToSql =
{
	"Integer":function()
	{
		return 'INTEGER';
	},
	"Float":function()
	{
		return 'REAL';
	},
	"String":function(field)
	{
		return 'VARCHAR(' + field.maxLength +')';
	}
};
