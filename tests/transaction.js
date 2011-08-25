function transaction(){
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

        var City = new JStORM.Model({
                name: "City",
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
			Person.dropTable();
                        City.dropTable();
			Person.createTable();
                        City.createTable();
		},
		"1 test a lot of inserts in transaction": function(){
			Person.transaction(function(){
				for (var i = 0; i < 100; i++) 
					new Person({
						firstName: "test",
						lastName: "test"
					}).save();
			});
			UnitTest.assertEqual(100, Person.all().count());
		},
		"2 test a lot of updates in transaction": function(){
			var person = Person.all().first();
			Person.transaction(function(){
				for (var i = 0; i < 100; i++) {
					person.firstName = i.toString();
					person.save();
				}
			});
			UnitTest.assertEqual("99", Person.all().first().firstName);
		},
		"3 test nested transactions":function(){
                    City.transaction(function(){
                        new City({
                                name: "test"
                        }).save();
                        Person.transaction(function(){
                            new Person({
                                    firstName: "test",
                                    lastName: "test"
                            }).save();
                        });
                    });
                },
		down: function(){
			Person.dropTable();
		}
	});
}
