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




	this.drawInOutPut = function({position, name, turnedOn = false, isInput = true, lastRunId}) {
		let fillColor = turnedOn ? "#f00" : "#888";
		this.drawLib.drawText({
			text: name + '/' + lastRunId,
			fontSize: 7,
			position: position.copy().add(new Vector((nodeRadius + 2) * (-1 + 2 * isInput), 0)),
			color: '#888',
			alignRight: !isInput
		});

		let strokeColor = lastRunId == Runner.curRunId ? '#00f' : '#666';

		this.drawLib.ctx.lineWidth = 3;
		this.drawLib.drawCircle({
			position: position,
			radius: nodeRadius,
			fillColor: fillColor,
			strokeColor: strokeColor
		});
		this.drawLib.ctx.lineWidth = 1;
	}
}

