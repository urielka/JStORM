function relations(){
	var Country = new JStORM.Model({
		name: "Country",
		fields: {
			name: new JStORM.Field({
				type: "String",
				maxLength: 25
			}),
			cities: new JStORM.Field({
				relationType: "ManyToOne",
				relatedModel: "City",
				relatedColumnName: "country"
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
			}),
			country: new JStORM.Field({
				relationType: "OneToMany",
				relatedModel: "Country"
			}),
			people: new JStORM.Field({
				relationType: "ManyToOne",
				relatedModel: "Person",
				relatedColumnName: "city"
			})
		},
		connection: "default"
	});
	
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
			}),
			city: new JStORM.Field({
				relationType: "OneToMany",
				relatedModel: "City"
			})
		},
		connection: "default"
	});
	
	return UnitTest.run({
		up: function(){
			Country.dropTable();
			City.dropTable();
			Person.dropTable();
			Country.createTable();
			City.createTable();
			Person.createTable();
		},
		"1 test create with relation": function(){
			var country = new Country({
				name: "Somecountry"
			}).save();
			var city = new City();
			city.name = "Somewhere";
			city.country = country;
			city.save();
			var someone = new Person({
				firstName: "John",
				lastName: "Doe",
				city: city
			});
			someone.save();
			UnitTest.assertDefined(someone.rowid, "someone wasn`t inserted");
		},
		"2 test retrieve model with relation": function(){
			var someone = new Person(1);
			UnitTest.assertTrue(someone.firstName == "John", "first name is wrong");
			UnitTest.assertTrue(someone.lastName == "Doe", "last name is wrong");
			UnitTest.assertTrue(!!someone.city, "no city");
			UnitTest.assertTrue(!!someone.city.country, "no country");
		},
		"3 test select from backward relation": function(){
			var somewhere = new City(1);
			var someone = somewhere.people.first();
		},
		"4 test remove from backward relation": function(){
			var somewhere = new City(1);
			var someone = new Person(1);
			someone.remove();
			UnitTest.assertTrue(somewhere.people.first() == false, "someone from somewhere wasn`t deleted");
		},
		"5 test cascade on delete": function(){
			throw new Error("not implemented");
		},
		"6 test if foreign key is enforced in an insert": function(){
			throw new Error("not implemented");
		},
		"7 test if foreign key is enforced in an update": function(){
			throw new Error("not implemented");
		},
		down: function(){
			Country.dropTable();
			City.dropTable();
			Person.dropTable();
		}
	});
}
