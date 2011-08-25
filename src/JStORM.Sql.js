/*
 	Script: JStORM.Sql.js
 	        contains code for sql generation
 	
 	License:
 	        MIT-style license.
*/
JStORM.Sql = function(metaData)
{
	this._meta = metaData;
	this.quote_name = this._meta.dialect.quote_name;
};
JStORM.Sql.prototype =
{
	getDeleteSql:function(whereCaluse)
	{
		var sql = ["DELETE FROM ",this._meta.tableName];
		if (whereCaluse.length > 0)
		{
			sql.push(" WHERE ");
			sql.push(whereCaluse.join(" AND "))
		}
		return sql.join("");
	},
	getCountSql:function(whereCaluse)
	{
		var sql = ["SELECT COUNT(",this.quote_name(this._meta.pk.columnName),") AS c FROM ",this._meta.tableName];
		if (whereCaluse.length > 0)
		{
			sql.push(" WHERE ");
			sql.push(whereCaluse.join(" AND "))
		}
		return sql.join("");
	},
	getSelectSql:function(whereCaluse,orderBy,limit,offset)
	{
		var sql = [
			"SELECT ",this._fieldsSelect(this._meta.tableName)," FROM ",this._meta.tableName,this._joinSelect(this._meta.tableName)
		];	
		if(whereCaluse.length > 0)
		{
			sql.push(" WHERE ");
			sql.push(whereCaluse.join(" AND "));
		}
		if(orderBy.length > 0)
		{
			sql.push(" ORDER BY ");
			sql.push(orderBy.join(","));
		}
		if(limit != 0)
		{
			sql.push(" LIMIT ");
			sql.push(limit);
		}
		if(limit != 0 && offset != 0)
		{
			sql.push(" OFFSET ");
			sql.push(offset);
		}
		return sql.join("");
	},
	getCreateTableSql:function()
	{
		var query = ["CREATE TABLE ",this._meta.tableName,"("];
		
		query.push(this._meta.pk.columnName," ",this._meta.pk.sqlType,",")
		JStORM.each(this._meta.fields,function(field)
		{
			query.push(field.columnName," ",field.sqlType,",");
		});
		//TODO: add foreign key constraint and not null if needed, default
		JStORM.each(this._meta.relations,function(relation)
		{
			if(relation.relationType == "OneToMany")
				query.push(relation.columnName," ",relation.sqlType,",");
		});
		query = query.splice(0,query.length-1);
		query.push(")");
		return query.join("");
	},
	getDropTableSql:function()
	{
		return "DROP TABLE " + this._meta.tableName;
	},
	getInsertSql:function()
	{
		return ["INSERT INTO ",this._meta.tableName," (",
			this._fields(),
			") VALUES (",
			this._values(),")"].join("");

	},
	getUpdateSql:function()
	{
		return ["UPDATE ",this._meta.tableName," SET ",this._fieldsValue()," WHERE ",this._meta.pk.columnName," = ?"].join("");
	},
	_fieldsSelect:function(relationPrefix)
	{
		var fields = [];
		var self  = this;
		fields.push(relationPrefix + "." + this.quote_name(this._meta.pk.columnName) + " AS " + relationPrefix + "_" + this._meta.pk.fieldName);
		
		JStORM.each(this._meta.fields,function(field){
			fields.push(relationPrefix + "." + self.quote_name(field.columnName) + " AS " + relationPrefix + "_" + field.fieldName);
		});
		JStORM.each(this._meta.relations,function(relation){
			if (relation.relationType == "OneToMany")
			{
				var relatedModel = relation.relatedModel();
				if(relatedModel == self._meta.modelClass)
					fields.push(relationPrefix + "." + self.quote_name(relation.fieldName)  + " AS " + relationPrefix + "_" + relation.fieldName);
				else
					fields.push(relatedModel._sql._fieldsSelect(relationPrefix + "_" + relation.fieldName));
			}
		});
		
		return fields.join(",");
	},
	_fieldsValue:function()
	{
		var fields = [];
		var self  = this;
		JStORM.each(this._meta.fields,function(field){
			fields.push(self.quote_name(field.columnName) + " = ?");
		});
		JStORM.each(this._meta.relations,function(relation){
			if(relation.relationType == "OneToMany")
				fields.push(self.quote_name(relation.columnName)  + " = ?");
		});
		
		return fields.join(",");
	},
	_fields:function()
	{
		var fields = [];
		var self  = this;
		JStORM.each(this._meta.fields,function(field){
			fields.push(self.quote_name(field.columnName));
		});
		JStORM.each(this._meta.relations,function(relation){
			if(relation.relationType == "OneToMany")
				fields.push(self.quote_name(relation.columnName));
		});
		
		return fields.join(",");
	},
	_values:function()
	{
		var fields = [];
		var self  = this;
		JStORM.each(this._meta.fields,function(field){
			fields.push("?");
		});
		JStORM.each(this._meta.relations,function(relation){
			if(relation.relationType == "OneToMany")
				fields.push("?");
		});
		
		return fields.join(",");
	},
	_joinSelect:function(relationPrefix)
	{
		var sql = [];
		var cls = this._meta.modelClass;
		var quote_name = this.quote_name;
		JStORM.each(this._meta.relations,function(relation)
		{
			if(relation.relationType == "OneToMany")
			{
				var relatedModel = relation.relatedModel();
				if (relatedModel != cls)
				{
					var relatedName = relationPrefix + "_" + relatedModel._meta.tableName;
					sql.push(" LEFT JOIN ");
					sql.push(relatedModel._meta.tableName);
					sql.push(" AS ")
					sql.push(relatedName);
					sql.push(" ON ");
					sql.push(relatedName);
					sql.push(".");
					sql.push(quote_name(relatedModel._meta.pk.columnName));
					sql.push(" = ");
					sql.push(relationPrefix);
					sql.push(".");
					sql.push(quote_name(relation.columnName));
					sql.push(relatedModel._sql._joinSelect(relationPrefix + "_" + relation.fieldName));
				}
			}
		});
		return sql.join("");
	}
};
