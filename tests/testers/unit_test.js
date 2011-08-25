var UnitTest = 
{
	assertDefined:function(obj,msg)
	{
		if(obj == undefined)
		{
			throw new Error(msg || "wasn`t defined");
		}
	},
	assertTrue:function(obj,msg)
	{
		if(obj != true)
		{
			throw new Error(msg || "expected true");
		}
	},
	assertFalse:function(obj,msg)
	{
		if(obj != false)
		{
			throw new Error(msg || "expected false");
		}
	},
	assertEqual:function(expected,given)
	{
		if(expected != given)
		{
			throw new Error("expected: "+expected + " got: "+given);
		}
	},
	run:function(Tests)
	{
		var testsToRunInOrder = [];
		for (var testName in Tests)
		{
			if(testName != "up" && testName != "down")
				testsToRunInOrder.push(testName);
		}
		var testPrefixRegex = /(\d+) /;
		//order based on prefix,put up and down first and last
		testsToRunInOrder.sort(function(lhs,rhs)
		{
			return parseInt(lhs.match(testPrefixRegex)[1]) - 
				   parseInt(rhs.match(testPrefixRegex)[1]);
		});
		testsToRunInOrder = ["up"].concat(testsToRunInOrder);
		testsToRunInOrder.push("down");
		var results = [];
		for (var i = 0, l = testsToRunInOrder.length; i < l; i++)
		{
			var testName = testsToRunInOrder[i];
			var test = Tests[testName];
			var start = new Date().getTime(),message = "OK",testResult = true;
			try
			{
				JStORM.log(testName + ", started...")
				test();
				JStORM.log(testName + ", done!");
			} 
			catch (e)
			{
				JStORM.log(e);
				JStORM.log(testName + ", error :)");
				message = e.message + (e.sourceURL && e.line ? "(" + e.sourceURL + "," + e.line + ")" : "");
				testResult = false;
			}
			
			results.push({
				good:testResult,
				name:testName,
				message:message,
				time:((new Date().getTime()) - start)
			});
		}
		
		return results;
	},
	renderHtmlDOM:function(results,container)
	{
		var table = document.createElement("table");
		table.id = "results";
		table.setAttribute("border","1");
		table.setAttribute("width","100%");
		var tbody = document.createElement("tbody");
		for(var i=0;i<results.length;i++)
		{
			var result = results[i];
			this.appendDOMRow(tbody,result.good,result.name,result.message,result.time)
		}
		table.appendChild(tbody);
		container.appendChild(table);
	},
	renderHtmlString:function(results)
	{
		var resString = ["<table border='1' width='100%' id='results'><tbody>"];
		
		for(var i=0;i<results.length;i++)
		{
			var result = results[i];
			resString.push(this.appendStringRow(result.good,result.name,result.message,result.time))
		}
		resString.push("</tbody></table>")
		return resString.join("");
	},
	appendStringRow:function(good,testName,msg,time)
	{
		return ["<tr style='border:1px solid #C0C0C0;background-color:",good ? "#80FF00" : "red","'><td>",testName,
				"</td><td>",msg,"</td><td>",time," ms</td></tr>"].join("");
	},
	appendDOMRow:function(tbody,good,testName,msg,time)
	{
		var row = document.createElement("tr");
		row.setAttribute("style","border:1px solid #C0C0C0;");
		var name = document.createElement("td");
		var status = document.createElement("td");
		var timeTd = document.createElement("td");
		name.innerHTML = testName;
		status.innerHTML = msg;
		row.style.backgroundColor= good ? "#80FF00" : "red";
		if(time || time == 0)timeTd.innerHTML = time + " ms";
		row.appendChild(name);
		row.appendChild(status);
		row.appendChild(timeTd);
		tbody.appendChild(row);
	}
};