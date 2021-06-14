
function _Renderer() {
	let HTML = {
		canvas: worldCanvas,
	}

	this.camera = new Renderer_Camera();
	this.drawLib = new Renderer_DrawLib({canvas: HTML.canvas});
	
	this.setup = function() {
		this.update();
	}	

	this.update = function() {
		this.drawLib.clearCanvas();
		this.drawLib.drawBackground();

	
		this.drawInputs();
		this.drawOutputs();
		// this.drawLib.drawWorldGrid();

		requestAnimationFrame(function () {Renderer.update()});
	}


	const inOutPutRadius = 15;
	const inOutPutMargin = 10;

	this.drawInputs = function() {
		let worldMiddle = World.size.value[1] / 2;
		for (let i = 0; i < World.curComponent.inputs.length; i++)
		{
			let y = worldMiddle - (World.curComponent.inputs.length / 2 - i) * (inOutPutRadius * 2 + inOutPutMargin * 2);
			this.drawInOutPut({
				position: new Vector(0, y),
				name: World.curComponent.inputs[i].name,
				isInput: true,
				turnedOn: true,
			});
		}
	}

	this.drawOutputs = function() {
		let worldMiddle = World.size.value[1] / 2;
		for (let i = 0; i < World.curComponent.outputs.length; i++)
		{
			let y = worldMiddle - (World.curComponent.outputs.length / 2 - i) * (inOutPutRadius * 2 + inOutPutMargin * 2);
			this.drawInOutPut({
				position: new Vector(World.size.value[0], y),
				name: World.curComponent.outputs[i].name,
				isInput: false,
				turnedOn: true,
			});
		}
	}


	this.drawInOutPut = function({position, name, turnedOn = false, isInput = true}) {
		let fillColor = turnedOn ? "#f00" : "#888";
		this.drawLib.drawText({
			text: name,
			fontSize: 13,
			position: position.copy().add(new Vector(inOutPutRadius + 5, 3)),
			color: '#eee'
		});


		this.drawLib.ctx.lineWidth = 3;
		this.drawLib.drawCircle({
			position: position,
			radius: inOutPutRadius,
			fillColor: fillColor,
			strokeColor: '#ccc'
		})
	}
}

