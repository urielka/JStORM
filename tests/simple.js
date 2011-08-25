function simple(){
	var Person = new JStORM.Model({
		name: "Person",
		fields: {
			firstName: new JStORM.Field({
				type: "String",
				maxLength: 25
			}),
			lastName: new JStORM.Field({
				type: "String",
				maxLength: 25
			})
		},
		connection: "default"
	});
	
	return UnitTest.run({
		up: function(){
			Person.dropTable();
			Person.createTable();
		},
		"1 test if create works": function(){
			var someone = new Person();
			someone.firstName = "John";
			someone.lastName = "Doe";
			someone.save();
			UnitTest.assertDefined(someone.rowid, "someone wasn`t inserted");
		},
		"2 test if retrieve using constructor works": function(){
			var someone = new Person(1);
			UnitTest.assertTrue(someone.firstName == "John", "first name is wrong");
			UnitTest.assertTrue(someone.lastName == "Doe", "last name is wrong");
		},
		"3 test if update works": function(){
			var someone = new Person(1);
			someone.firstName = "updated";
			someone.save();
			var fromDb = new Person(1);
			UnitTest.assertTrue(fromDb.firstName == "updated", "someone wasn`t updated");
		},
		"4 test if count works": function(){
			UnitTest.assertEqual(1, Person.all().count());
			new Person({
				firstName: "test",
				lastName: "test"
			}).save();
			UnitTest.assertEqual(2, Person.all().count());
			UnitTest.assertEqual(1, Person.filter("firstName = ?", "test").count());
		},
		"5 test if delete works": function(){
			var someone = Person.all().first();
			var id = someone.rowid;
			someone.remove();
			UnitTest.assertTrue(Person.getByPk(id) == false, "someone wasn`t deleted");
		},
		down: function(){
			Person.dropTable();
		}
	});
};
