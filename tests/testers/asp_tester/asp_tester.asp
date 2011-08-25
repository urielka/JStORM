<!DOCTYPE html>
<html>
	<head>
		<script language="JavaScript" runat="server" src="../fixtures.js"></script>
		<script language="JavaScript" runat="server" src="../unit_test.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.Query.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.Sql.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.Model.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.ModelMetaData.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.Field.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/JStORM.Events.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/providers/JStORM.ASP.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/dialects/JStORM.SQLServer.js"></script>
		<script language="JavaScript" runat="server" src="../../../src/dialects/JStORM.Access.js"></script>
		<script language="JavaScript" runat="server" src="asp_tester.js"></script>
		<script>
			window.onload = function()
			{
				var logs = document.getElementById("logs");
				var showHide = document.getElementById("showHideLogs");
				showHide.onclick = function()
				{
					if (logs.style.display == "none") 
					{
						showHide.innerHTML = "Hide logs";
						logs.style.display = "block";
					}
					else
					{
						showHide.innerHTML = "Show logs";
						logs.style.display = "none";
					}
				};
			};
		</script>
	</head>
	<body>
		<form action="asp_tester.asp" method="get">
			<label for="fixtures">Fixture:</label>  
			<select id="fixtures" name="fixture">
				<%= ASPTester.fixtureOptions %>
			</select>
			<label for="database">Database:</label>
			<select id="database" name="database">
				<option <%= ASPTester.accessSelected %> value="access">Access</option>
				<option <%= ASPTester.sqlServerSelected %> value="sqlServer">SQL Server</option>
			</select>
			<input type="submit" id="run" value="Run"/>
		</form>
	    <%= testResults %>
		<a href="javascript:" id="showHideLogs">Show logs</a>
	    <div id="logs" style="display:none;"><%= logs %></div>
	</body>
</html>
