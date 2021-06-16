function Renderer_DrawLib({canvas}) {
	let HTML = {
		canvas: canvas,
	}
	
	const ctx = HTML.canvas.getContext("2d");
	ctx.constructor.prototype.circle = function(x, y, size) {
		if (size < 0) return;
		this.ellipse(
			x, 
			y, 
			size,
			size,
			0,
			0,
			2 * Math.PI
		);
	};
	this.ctx = ctx;


	this.clearCanvas = function() {
		ctx.clearRect(0, 0, HTML.canvas.width, HTML.canvas.height);
	}

	this.drawBackground = function() {
		ctx.fillStyle = '#555';
		ctx.fillRect(0, 0, HTML.canvas.width, HTML.canvas.height);
		this.drawRect({
			position: new Vector(0, 0),
			diagonal: World.size,
			fillColor: '#333'
		})
	}




	this.drawCenteredText = function({text, position, fontSize, color}) {
		let size = this.getTextBoundingBox({text: text, fontSize: fontSize});

		let newPosition = position.copy().add(size.copy().scale(-.5));
		this.drawText({
			text: text,
			position: newPosition,
			fontSize: fontSize,
			color: color
		});
		this.drawRect({
			position: newPosition,
			diagonal: size,
			strokeColor: "#0f0",
		})
	}	


	this.drawText = function({text, position, fontSize, color}) {
		let canvPos = Renderer.camera.worldPosToCanvPos(position);
		ctx.fillStyle = color;
		ctx.font = (fontSize / Renderer.camera.zoom) + "px Georgia";
		ctx.beginPath();

		ctx.fillText(text, canvPos.value[0], canvPos.value[1]);
		ctx.closePath();
		ctx.fill();		
	}

	this.getTextBoundingBox = function({text, fontSize}) {
		ctx.font = (fontSize / Renderer.camera.zoom) + "px Georgia";
		let size = ctx.measureText(text);
		return new Vector(
			size.width, 
			size.actualBoundingBoxAscent + size.actualBoundingBoxDescent
		).scale(Renderer.camera.zoom);
	}




	this.drawRect = function({position, diagonal, fillColor, strokeColor}) {
		if (fillColor) ctx.fillStyle = fillColor;
		if (strokeColor) ctx.strokeStyle = strokeColor;


		let startPos = Renderer.camera.worldPosToCanvPos(position);
		let endPos = Renderer.camera.worldPosToCanvPos(position.copy().add(diagonal));

		ctx.beginPath();
		ctx.rect(
			startPos.value[0],
			startPos.value[1],
			endPos.value[0] - startPos.value[0],
			endPos.value[1] - startPos.value[1],
		);

		ctx.closePath();
		if (fillColor) ctx.fill();
		if (strokeColor) ctx.stroke();
	}

	this.drawCircle = function({position, radius, fillColor, strokeColor}) {
		if (fillColor) ctx.fillStyle = fillColor;
		if (strokeColor) ctx.strokeStyle = strokeColor;

		let canvPos = Renderer.camera.worldPosToCanvPos(position);
		let canvRad = radius / Renderer.camera.zoom;

		ctx.beginPath();
		ctx.ellipse(
			canvPos.value[0],
			canvPos.value[1],
			canvRad,
			canvRad,
			0,
			0,
			2 * Math.PI
		);
		ctx.closePath();

		if (fillColor) ctx.fill();
		if (strokeColor) ctx.stroke();
	}




	this.drawLine = function({startPosition, endPosition, color}) {
		let startPos = Renderer.camera.worldPosToCanvPos(startPosition);
		let endPos = Renderer.camera.worldPosToCanvPos(endPosition);

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(startPos.value[0], startPos.value[1]);
		ctx.lineTo(endPos.value[0], endPos.value[1]);
		ctx.closePath();
		ctx.stroke();
	}

	this.drawWorldGrid = function() {
		const gridSize = 50 * Math.ceil(this.camera.zoom);
		// ctx.strokeStyle = "#444";
		ctx.strokeStyle = "rgba(100, 100, 100, .1)";
		
		
		for (let dx = gridSize; dx < PhysicsEngine.world.size.value[0]; dx += gridSize)
		{
			let canvasPosA = this.camera.worldPosToCanvasPos(new Vector([
				dx, 
				0
			]));
			let canvasPosB = this.camera.worldPosToCanvasPos(new Vector([
				dx, 
				PhysicsEngine.world.size.value[1]
			]));

			ctx.beginPath();
			ctx.moveTo(canvasPosA.value[0], canvasPosA.value[1]);
			ctx.lineTo(canvasPosB.value[0], canvasPosB.value[1]);
			ctx.closePath();
			ctx.stroke();
		}

		for (let dy = gridSize; dy < PhysicsEngine.world.size.value[1]; dy += gridSize)
		{
			let canvasPosA = this.camera.worldPosToCanvasPos(new Vector([
				0,
				dy
			]));
			let canvasPosB = this.camera.worldPosToCanvasPos(new Vector([
				PhysicsEngine.world.size.value[0],
				dy
			]));

			ctx.beginPath();
			ctx.moveTo(canvasPosA.value[0], canvasPosA.value[1]);
			ctx.lineTo(canvasPosB.value[0], canvasPosB.value[1]);
			ctx.closePath();
			ctx.stroke();
		}
	}







	this.drawVector = function({position, delta, color}) {
		let startPos = this.camera.worldPosToCanvPos(position);
		let stopPos = this.camera.worldPosToCanvPos(position.copy().add(delta));

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(startPos.value[0], startPos.value[1]);
		ctx.lineTo(stopPos.value[0], stopPos.value[1]);
		ctx.closePath();
		ctx.stroke();
	}



	// this.drawBox = function(_box, _color = "#f00") {
	// 	let points = _box.getPoints();
	// 	for (let p = 0; p < points.length; p++) 
	// 	{
	// 		points[p] = this.camera.worldPosToCanvasPos(points[p]);
	// 	}

	// 	ctx.strokeStyle = _color;
	// 	ctx.beginPath();
	// 	ctx.moveTo(points[0].value[0], points[0].value[1]);
	// 	ctx.lineTo(points[1].value[0], points[1].value[1]);
	// 	ctx.lineTo(points[2].value[0], points[2].value[1]);
	// 	ctx.lineTo(points[3].value[0], points[3].value[1]);
	// 	ctx.lineTo(points[0].value[0], points[0].value[1]);
	// 	ctx.closePath();
	// 	ctx.stroke();
	// }



}

