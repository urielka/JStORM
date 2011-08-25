// JavaScript for JStORM ASP Tester
// Write to a global variable for logging
var logs = "";
JStORM.log = function (args)
{ 
	if (typeof args !== "string" && args.length)
    	args = Array.prototype.join.apply(args, [", "]); 
  	// Assume an object with a message property is an error
  	else if (args.message)
		//throw args
	    args = '<span style="color:#FF0000;">Error: ' + args.message + '</span>'; 
  	logs += String(args) + '<br />'; 
};

// Override some of the unit test methods to output to ASP
var testResults = ""; // Global for test output

var ASPTester = {
	/*
	Load the selected fixture and set the database
	*/
	init:function()
	{
		ASPTester.setCurrentDatabase();
		ASPTester.currentFixture = String(Request.queryString("fixture"));
		ASPTester.fixtureOptions = ASPTester.setFixtures();
		
		if (ASPTester.currentFixture !== "undefined") {
			// Eval is evil, but we're doing it here anyway because I don't 
			// know of a good way to insert a server side script tag. There
			// also is, AFAIK, no named global object, like window, on which
			// to apply functions, like with "window[fn]()"
			var src = Server.mapPath('../../' + ASPTester.currentFixture + ".js");
			eval(this._fso.openTextFile(src).readAll());
			var results = eval(ASPTester.currentFixture + "()");
			testResults = UnitTest.renderHtmlString(results);
		}
	},
	/*
	Combine the fixtures array from /tests/testers/fixtures.js into <select> options
	*/
	setFixtures:function()
	{
		var fxt = [];
		var option = "";
		for (var i = 0; i < Fixtures.length; i += 1)
		{
			option = '<option';
			if (ASPTester.currentFixture === Fixtures[i])
				option += ' selected';
			fxt.push(option,'>',Fixtures[i],'</option>');
		}
		return fxt.join("");
	},
	/*
	  Set the JStORM connection from the database select
	 */
	setCurrentDatabase:function()
	{
		var database = String(Request.queryString("database"));
		if (database === "undefined") { database = "access"; } // Access as default
		
		/** Return the string " selected " if the db is selected */
		var isSelected = function (type) {
			return database === type ? " selected " : "";
		}
		// Set selected option
		ASPTester.accessSelected = isSelected("access");
		ASPTester.sqlServerSelected = isSelected("sqlServer");
		
		// Set connection
		JStORM.connections = { 
			"default" : ASPTester[database + "DefaultConnection"]
		}
	},
	// File system object
	_fso : new ActiveXObject("Scripting.FileSystemObject"),
	accessDefaultConnection:{
		PROVIDER : "ASP",
		DIALECT : "Access",
		PATH : Server.mapPath("test.mdb")
	},
	sqlServerDefaultConnection:{
		PROVIDER : "ASP",
		DIALECT : "SQLServer",
		HOST : ".\\SQLEXPRESS",
		NAME : "JStORM",
		USER : "jstorm_test",
		PASS : "jstorm_test"
	}
};

ASPTester.init();