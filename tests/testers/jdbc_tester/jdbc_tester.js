// Init
load("../fixtures.js");

var JDBCTestConnections = {
	"mysql": {
		DRIVER 	: "com.mysql.jdbc.Driver",
		PROVIDER:"JDBC",
		DIALECT:"MySQL",
		HOST:"jdbc:mysql://127.0.0.1:3306/test_jaxer",
		USER:"testjaxer",
		PASS:"testjaxer"
	},
	
	"sqlite": {
		DRIVER 	: "org.sqlite.JDBC",
		PROVIDER:"JDBC",
		DIALECT:"SQLite",
		HOST:"jdbc:sqlite:test.db",
		NAME:"test_jdbc",
		USER:"sa",
		PASS:""
	}
};

	
// Load the jstorm library
load("../../../src/JStORM.js");
load("../../../src/JStORM.Field.js");
load("../../../src/JStORM.Events.js");
load("../../../src/JStORM.Model.js");
load("../../../src/JStORM.ModelMetaData.js");
load("../../../src/JStORM.Query.js");
load("../../../src/JStORM.Sql.js");
load("../../../src/dialects/JStORM.SQLite.js");
load("../../../src/dialects/JStORM.MySQL.js");
load("../../../src/providers/JStORM.JDBC.js");
//load the unit test framework
load("../unit_test.js");
JStORM.log = function (args)
{ 
	if (typeof args !== "string" && args.length)
    	args = Array.prototype.join.apply(args, [", "]); 
  	// Assume an object with a message property is an error
  	else if (args.message)
		//throw args
	    args = args.message; 
  	print("LOG: "+String(args)); 
};
var dbName = arguments[0],testName = arguments[1];
var window = this;
JStORM.connections["default"] = JDBCTestConnections[dbName];
print("\n"+dbName);

var tests = testName == "all" ? Fixtures : [testName];
for (var j = 0; j < tests.length; j++)
{
	testName = tests[j];
	load("../../" + testName + ".js");
	var results = window[testName]();
	print("\n\tRESULTS FOR " + testName + "\n");
	var goodCount = 0;
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		goodCount += result.good;
		print("\t\t\t" + result.name + " \t|\t  " + result.message + " \t|\t " + result.time + " ms");
	}
	print("\n\tTESTS RUN: " + results.length + " FAILURES: " +(results.length - goodCount));
	JStORM.closeAllConnections();
}
	    



