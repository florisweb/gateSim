
<!DOCTYPE html>
<html>
	<head>
		<title>GateSimulator</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>

		<link rel="stylesheet" type="text/css" href="main_min.css">
	</head>	
	<body>		
		<div id='sideBar'>
			<div class='button bDefault bBoxy text' onclick='Builder.newChip()'>New Component</div>
			<div id='componentHolder'></div>

		</div>
		<div id='mainContent'>
			<div class='header'>
				<input class='inputHolder text titleHolder' placeholder="Component name">
				<div class='button bDefault bBoxy packageButton' onclick='Builder.packageComponent()'>Package</div>
			</div>
			<canvas id="worldCanvas" width="800" height="600"></canvas>
		</div>
	
		<script type="text/javascript" src="main_min.js"></script>
		
	</body>
</html>	