function query(){
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
			new Person({firstName:"John 1",lastName:"Doe 2"}).save();
			new Person({firstName:"John 2",lastName:"Doe 1"}).save();
			new Person({firstName:"John 3",lastName:"Doe 3"}).save();
			new Person({firstName:"John 4",lastName:"Doe 3"}).save();
		},
		"1 test that filter works":function()
		{
			var johnDoe1 = Person.filter("firstName = ?","John 1");
			UnitTest.assertTrue(!!johnDoe1.next());
			johnDoe1.close();
		},
		"2 test that order by works":function()
		{
			var allPersonByOrder = Person.all().orderBy("lastName").toArray();
			UnitTest.assertEqual("Doe 1",allPersonByOrder[0].lastName);
			UnitTest.assertEqual("Doe 2",allPersonByOrder[1].lastName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[2].lastName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[3].lastName);
		},
		"3 test that secondary order by works":function()
		{
			var allPersonByOrder = Person.all().orderBy("lastName","firstName").toArray();
			UnitTest.assertEqual("Doe 1",allPersonByOrder[0].lastName);
			UnitTest.assertEqual("John 2",allPersonByOrder[0].firstName);
			UnitTest.assertEqual("Doe 2",allPersonByOrder[1].lastName);
			UnitTest.assertEqual("John 1",allPersonByOrder[1].firstName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[2].lastName);
			UnitTest.assertEqual("John 3",allPersonByOrder[2].firstName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[3].lastName);
			UnitTest.assertEqual("John 4",allPersonByOrder[3].firstName);
		},
		"4 test that first works":function()
		{
			var johnDoe1 = Person.all().first();
			UnitTest.assertEqual("John 1",johnDoe1.firstName);
		},
		down: function(){
			//Person.dropTable();
		}
	});
};

function query(){
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
			age: new JStORM.Field({
                type: "Integer"
			})
		},
		connection: "default"
	});
	
	return UnitTest.run({
		up: function(){
			Person.dropTable();
			Person.createTable();
			new Person({firstName:"John 1",lastName:"Doe 2", age: 25}).save();
			new Person({firstName:"John 2",lastName:"Doe 1", age: 15}).save();
			new Person({firstName:"John 3",lastName:"Doe 3", age: 47 }).save();
			new Person({firstName:"John 4",lastName:"Doe 3", age: 56 }).save();
		},
		"1 test that filter works":function()
		{
			var filterPersonByAge = Person.filter("age BETWEEN ? AND ?", 25, 47);
			UnitTest.assertEqual(2, filterPersonByAge.count());
			filterPersonByAge.close();
			
			var filterPersonByFirstName = Person.filter("firstName Like ?", "%John%");
			UnitTest.assertEqual(4, filterPersonByFirstName.count());
			filterPersonByFirstName.close();					
		},
		"2 test that limit works":function() {
            var people = Person.filter("firstName Like ?", "%John%").limit(2).toArray();
            UnitTest.assertEqual(2, people.length);
		},
		"3 test that offset works": function() {
            var people = Person.filter("firstName Like ?", "%John%").offset(1).limit(3).toArray();
            UnitTest.assertEqual(3, people.length);
			UnitTest.assertEqual("John 2",people[0].firstName)
		},		
		"4 test that each works": function() {
            var people = Person.all().orderBy("lastName");
            var counter = 0;
            people.each(function(person) {
                counter++;
            });
            UnitTest.assertEqual(4, counter);
            people.close();
		},		
		"5 test that order by works":function()
		{
			var allPersonByOrder = Person.all().orderBy("lastName").toArray();
			UnitTest.assertEqual("Doe 1",allPersonByOrder[0].lastName);
			UnitTest.assertEqual("Doe 2",allPersonByOrder[1].lastName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[2].lastName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[3].lastName);
		},
		"6 test that secondary order by works":function()
		{
			var allPersonByOrder = Person.all().orderBy("lastName","firstName").toArray();
			UnitTest.assertEqual("Doe 1",allPersonByOrder[0].lastName);
			UnitTest.assertEqual("John 2",allPersonByOrder[0].firstName);
			UnitTest.assertEqual("Doe 2",allPersonByOrder[1].lastName);
			UnitTest.assertEqual("John 1",allPersonByOrder[1].firstName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[2].lastName);
			UnitTest.assertEqual("John 3",allPersonByOrder[2].firstName);
			UnitTest.assertEqual("Doe 3",allPersonByOrder[3].lastName);
			UnitTest.assertEqual("John 4",allPersonByOrder[3].firstName);
		},
		"7 test that first works":function()
		{
			var johnDoe1 = Person.all().first();
			UnitTest.assertEqual("John 1",johnDoe1.firstName);
		},
		"8 test that remove works": function() {
            Person.filter("age=?",25).remove();            
            UnitTest.assertEqual(3, Person.all().count());
		},
		down: function(){
			//Person.dropTable();
		}
	});
};

