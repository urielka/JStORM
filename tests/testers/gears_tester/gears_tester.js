JStORM.connections = 
{
	"default":
	{
		PROVIDER:"Gears",
		DIALECT:"SQLite",
		PATH:"test_simple"
	}
};

var GearsTester = 
{
	loadedTest:{},
	init:function()
	{
		GearsTester.fixtures = document.getElementById("fixtures");
		GearsTester.run = document.getElementById("run");
		GearsTester.resultConatiner = document.getElementById("resultsConatiner");
		GearsTester.setFixtures();
		GearsTester.attachEvents();
	},
	setFixtures:function()
	{
		for(var i=0;i<Fixtures.length;i++)
		{
			var fixture = GearsTester.fixtures.options[i] = new Option();
			fixture.value = fixture.innerHTML = Fixtures[i];
		}
	},
	runFixture:function()
	{
		var fixture = GearsTester.fixtures[GearsTester.fixtures.selectedIndex].value;
		var run = function ()
		{
			GearsTester.resultConatiner.innerHTML = "";
			UnitTest.renderHtmlDOM(window[fixture](),GearsTester.resultConatiner);
		};
		
		if (!GearsTester.loadedTest[fixture])
		{
			GearsTester.loadedTest[fixture] = true;
			var script = document.createElement("script");
			script.src = "../../" + fixture + ".js";
			document.getElementsByTagName("head")[0].appendChild(script);
			script.onload = run;
		}	
		else
			run();			
	},
	attachEvents:function()
	{
		GearsTester.run.onclick = GearsTester.runFixture;
	}
}
window.onload = GearsTester.init;
