
<!DOCTYPE html>
<html>
	<head>
		<title>GateSimulator</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>

		<link rel="stylesheet" type="text/css" href="main_min.css?a=11">
	</head>	
	<body>		
		<div id='sideBar'>

			<div id='componentHolder'>
				<div class='component' onclick=' 
					nandGate = new NandGateComponent({position: new Vector(0, 0)});
      				nandGate.addInverter();
      				World.curComponent.addComponent(nandGate);
      			'>
					<div class='title text'>Nand Gate</div>
					<img class='icon optionIcon' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>

				<div class='component' onclick='World.curComponent.addComponent(ComponentManager.importComponent(andGateData))'>
					<div class='title text'>And Gate</div>
					<img class='icon optionIcon' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>
				
				<div class='component' onclick='World.curComponent.addComponent(ComponentManager.importComponent(orGateData))'>
					<div class='title text'>Or Gate</div>
					<img class='icon optionIcon' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>
			</div>

		</div>
		<div id='mainContent'>
			<div class='header'>
				<input class='inputHolder text titleHolder' placeholder="Component name">
				<div class='button bDefault bBoxy packageButton'>Package</div>
			</div>
			<canvas id="worldCanvas" width="800" height="600"></canvas>
		</div>
	
		<script type="text/javascript" src="main_min.js"></script>
		
	</body>
</html>	