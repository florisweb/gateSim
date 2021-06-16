
<!DOCTYPE html>
<html>
	<head>
		<title>GateSimulator</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>

		<link rel="stylesheet" type="text/css" href="main_min.css?a=11">
	</head>	
	<body>		
		<div id='sideBar'>
			<div class='button bDefault bBoxy text' onclick='World.clear()'>New Component</div>
			<div id='componentHolder'>
				<div class='component' onclick=' 
					nandGate = new NandGateComponent({position: new Vector(0, 0)});
      				nandGate.addInverter();
      				World.curComponent.addComponent(nandGate);
      			'>
					<div class='titleHolder text'>Nand Gate</div>
					<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>

				<div class='component' onclick='World.curComponent.addComponent(ComponentManager.importComponent(ComponentManager.components[1]))'>
					<div class='titleHolder text'>And Gate</div>
					<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>

				<div class='component' onclick='World.curComponent.addComponent(ComponentManager.importComponent(ComponentManager.components[0]))'>
					<div class='titleHolder text'>Or Gate</div>
					<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>
					<canvas class='componentPreview'></canvas>
				</div>
			</div>

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