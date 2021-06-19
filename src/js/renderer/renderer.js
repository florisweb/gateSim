const nodeRadius = 10;
const inOutPutMargin = 5;


function _Renderer() {
	let HTML = {
		canvas: worldCanvas,
	}
	this.maxRenderDepth = 1;

	this.camera = new Renderer_Camera();
	this.drawLib = new Renderer_DrawLib({canvas: HTML.canvas});
	
	this.setup = function() {
		this.update();
	}

	this.update = function() {
		this.drawLib.clearCanvas();
		this.drawLib.drawBackground();
		this.drawLib.drawWorldGrid();

	
		World.curComponent.draw();
		for (let line of Builder.curBuildLines) line.draw();

		requestAnimationFrame(function () {Renderer.update()});
	}



	this.drawInOutPutArray = function({position, items, availableHeight, isInputArray = true}) {
		for (let i = 0; i < items.length; i++)
		{
			let y = availableHeight / 2 - (items.length / 2 - i - .5) * (nodeRadius * 2 + inOutPutMargin * 2);
			this.drawInOutPut({
				position: position.copy().add(new Vector(0, y)),
				name: items[i].name,
				isInput: isInputArray,
				turnedOn: items[i].turnedOn,
			});
		}
	}


	this.drawInOutPut = function({position, name, turnedOn = false, isInput = true}) {
		let fillColor = turnedOn ? "#f00" : "#888";
		// this.drawLib.drawText({
		// 	text: name,
		// 	fontSize: 13,
		// 	position: position.copy().add(new Vector(nodeRadius + 5, 3)),
		// 	color: '#eee'
		// });


		this.drawLib.ctx.lineWidth = 3;
		this.drawLib.drawCircle({
			position: position,
			radius: nodeRadius,
			fillColor: fillColor,
			strokeColor: '#666'
		});
		this.drawLib.ctx.lineWidth = 1;
	}
}

