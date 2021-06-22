
<!DOCTYPE html>
<html>
	<head>
		<title>GateSimulator</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>

		<link rel="stylesheet" type="text/css" href="main_min.css">
	</head>	
	<body class='noselect'>		
		<div id='sideBar'>
			<div class='page'>
				<div class='button bDefault bBoxy text' onclick='Builder.newChip()'>+ New Component</div>
				<br>
				<div class='componentList favorites'>
					<div class="header clickable">
						<img src="images/icons/dropDownIcon.png" class="headerIcon dropDownButton">
						<div class="text headerText">Favourites</div>
					</div>
					<div class='componentHolder hide'></div>
				</div>

				<div class='componentList myComponents'>
					<div class="header clickable">
						<img src="images/icons/dropDownIcon.png" class="headerIcon dropDownButton">
						<div class="text headerText">All Components</div>
					</div>
					<div class='componentHolder hide'></div>
				</div>
			</div>
			
			<div class='page searchPage hide'>
				<input placeholder="Search..." class='text inputField'>
				<div class='componentHolder'></div>
			</div>
		</div>
		<div id='mainContent'>
			<div class='header'>
				<input class='inputHolder text titleHolder' placeholder="Component name">
				<div class='button bDefault bBoxy packageButton' onclick='Builder.packageComponent()'>Package</div>
			</div>
			<canvas id="worldCanvas" width="800" height="600"></canvas>
		</div>
	
		<script type="text/javascript" src="/JS/request2.js"></script>
		<script type="text/javascript" src="main_min.js"></script>
		
	</body>
</html>	