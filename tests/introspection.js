function introspection(){
	var Model1 = new JStORM.Model({
		name: "Model1",
		fields: {
			name: new JStORM.Field({
				type: "String",
				maxLength: 25
			})
		},
		connection: "default"
	});
	var Model2 = new JStORM.Model({
		name: "Model2",
		fields: {
			name: new JStORM.Field({
				type: "String",
				maxLength: 25
			})
		},
		connection: "default"
	});
	
	return UnitTest.run({
		up: function(){
			Model1.dropTable();
			Model2.dropTable();
		},
		"1 test if doesTableExist works": function(){
			var introspection = JStORM.getIntrospection("default");
			UnitTest.assertFalse(introspection.doesTableExist("Model1", "Model2"));
			Model1.createTable();
			UnitTest.assertTrue(introspection.doesTableExist("Model1"));
			Model2.createTable();
			UnitTest.assertTrue(introspection.doesTableExist("Model2"));
			UnitTest.assertTrue(introspection.doesTableExist("Model1", "Model2"));
		},
		down: function(){
			Model1.dropTable();
			Model2.dropTable();
		}
	});
}
