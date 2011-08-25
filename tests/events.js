function events(){
	var Person = new JStORM.Model({
		name: "Person",
		fields: {
			firstName: new JStORM.Field({
				type:"String",maxLength: 25
			}),
			lastName: new JStORM.Field({
				type:"String",maxLength: 25
			})
		},
		connection:"default"
	});
	
	return UnitTest.run({
		up: function(){
			Person.dropTable();
			Person.createTable();
		},
		"1 test if model events work": function(){
			var flagSave = "", flagRemove = "";
			Person.addListener("onBeforeSave", function(){
				flagSave += "Before"
			});
			Person.addListener("onAfterSave", function(){
				flagSave += "After"
			});
			Person.addListener("onBeforeRemove", function(){
				flagRemove += "Before"
			});
			Person.addListener("onAfterRemove", function(){
				flagRemove += "After"
			});
			var someone = new Person();
			someone.firstName = "Jhon";
			someone.lastName = "Doe";
			someone.save();
			UnitTest.assertEqual("BeforeAfter", flagSave);
			someone.remove();
			UnitTest.assertEqual("BeforeAfter", flagRemove);
		},
		down: function(){
			Person.dropTable();
		}
	});
}
