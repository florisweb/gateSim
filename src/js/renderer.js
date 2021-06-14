function _RenderEngine() {
	let HTML = {
		canvas: gameCanvas,
	}
	this.HTML = HTML;

	this.settings = new function() {
		this.renderVectors = false;
		this.renderPositionTrace = false;
	}
	this.camera = new RenderEngine_Camera();


	
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
	}


	let lastUpdate = new Date();
	let fps = 0;
	let fpsSum = 0;
	this.update = function() {
		Animator.update();
		this.camera.update();

		this.clearCanvas();
		this.drawWorldBackground();
		this.drawWorldGrid();



		for (let i = 0; i < PhysicsEngine.bodies.length; i++)
		{
			this.drawEntity(PhysicsEngine.bodies[i]);
		}
		

		this.drawBuildPoints();
		this.drawBuilderPreview();


		this.drawClientCursors();



		fpsSum += 1000 / ((new Date() - lastUpdate));
		if (Game.updates % 20 == 0) {fps = Math.round(fpsSum / 20); fpsSum = 0;}

		this.drawStatistics(fps + "/" + Game.maxFps);
		lastUpdate = new Date();

		if (!Game.running) return;
		requestAnimationFrame(function () {RenderEngine.update()});
	}






	this.clearCanvas = function() {
		ctx.clearRect(0, 0, HTML.canvas.width, HTML.canvas.height);
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
	
	this.drawWorldBackground = function() {
		// ctx.fillStyle = "#333";
		let position = this.camera.worldPosToCanvasPos(PhysicsEngine.world.size.copy().scale(.5));
		var grd = ctx.createRadialGradient(
			position.value[0],
			position.value[1],
			200 / this.camera.zoom,
			position.value[0],
			position.value[1],
			PhysicsEngine.world.size.value[0] / 2 / this.camera.zoom
		);
		grd.addColorStop(0, "#352820");
		grd.addColorStop(1, "#1c1c1c");

		ctx.fillStyle = grd;// "#1f1f1f";

		ctx.beginPath();	

		fillRect(
			new Vector([0, 0]),
			new Vector([PhysicsEngine.world.size.value[0], PhysicsEngine.world.size.value[1]])
		);

		ctx.fill();
	}

	function fillRect(_coordA, _coordB) {
		let canvasA = RenderEngine.camera.worldPosToCanvasPos(_coordA);
		let canvasB = RenderEngine.camera.worldPosToCanvasPos(_coordB);
		let size = canvasA.difference(canvasB);
		ctx.fillRect(canvasA.value[0], canvasA.value[1], size.value[0], size.value[1]);
	}



	this.drawEntity = function(_entity) {
		if (!this.camera.inView(_entity)) return false;
		let canvasPos = this.camera.worldPosToCanvasPos(_entity.position);


		if (_entity.draw) _entity.draw(ctx); else _entity.shape.draw();

		if (_entity.config.buildable && _entity === Builder.buildBody)
		{		
			ctx.strokeStyle = "#0f0";
			ctx.beginPath();
			ctx.circle(canvasPos.value[0], canvasPos.value[1], _entity.shape.shapeRange / this.camera.zoom);
			ctx.closePath();
			ctx.stroke();
		}

		// if (_entity.buildings) 
		// 	for (let i = 0; i < _entity.buildings.length; i++)
		// 	{
		// 		_entity.buildings[i].mesh.outerMesh.draw("#f00"); 
		// 		_entity.buildings[i].mesh.innerMesh.draw("#0f0");
		// 	}



		// ctx.strokeStyle = "#0f0";
		// ctx.beginPath();
		// ctx.circle(canvasPos.value[0], canvasPos.value[1], _entity.mesh.meshRange / this.camera.zoom);
		// ctx.closePath();
		// ctx.stroke();

		
		// _entity.mesh.innerMesh.draw("#00f");

		// if (typeof _entity.angle == "number") this.drawVector(_entity.position.copy(), new Vector([0, 0]).setAngle(_entity.angle, 30), "#fff");

		if (_entity.positionTrace && this.settings.renderPositionTrace) this.drawPointList(_entity.positionTrace);
	}

	this.drawVector = function(_startVector, _relativeVector, _color = "red") {
		let canStart = this.camera.worldPosToCanvasPos(_startVector);
		let canStop = this.camera.worldPosToCanvasPos(_startVector.add(_relativeVector));

		ctx.strokeStyle = _color;
		ctx.beginPath();
		ctx.moveTo(canStart.value[0], canStart.value[1]);
		ctx.lineTo(canStop.value[0], canStop.value[1]);
		ctx.closePath();
		ctx.stroke();
	}

	this.drawPointList = function(_points) {
		for (let p = 0; p < _points.length; p++)
		{
			let pos = this.camera.worldPosToCanvasPos(_points[p]);
			ctx.fillStyle = "#eee";
			ctx.beginPath();
			ctx.circle(pos.value[0], pos.value[1], 2);
			ctx.closePath();
			ctx.fill();
		}
	}


	this.drawBuilderPreview = function() {
		if (!Builder.building || !Builder.buildBody) return;
		let start = Builder.buildBody.position.copy().add(Builder.startPosition);
		let stop = Builder.buildBody.position.copy().add(Builder.stopPosition);

		let delta = start.difference(stop);


		this.drawVector(start, delta, "#00f");
	}

	this.drawBuildPoints = function() {
		let points = Builder.getBuildPoints();
		if (!points) return;
		this.drawPointList(points);

		let hoverPoint = Builder.getClosestBuildPoint(Builder.mousePos);
		if (!hoverPoint || !hoverPoint.point) return;

		let pos = this.camera.worldPosToCanvasPos(hoverPoint.point);
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.circle(pos.value[0], pos.value[1], 4);
		ctx.closePath();
		ctx.fill();
	}





	this.drawStatistics = function(_fps) {
		ctx.font = '14px arial';
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.fillText("Fps: " + _fps, 5, 20);
		ctx.fillText("Particles: " + PhysicsEngine.bodies.length, 5, 40);
		ctx.fillText("performance: " + window.performance, 5, 60);
		ctx.fillText("NextFrame: " + window.nextFrame, 5, 80);
		ctx.fillText("Acceleration: " + window.a, 5, 100);
		ctx.closePath();
		ctx.fill();
	}




	this.drawCircle = function(_circle, _color = "#f00") {
		let position = this.camera.worldPosToCanvasPos(_circle.getPosition());
		let radius = _circle.radius / this.camera.zoom;
		ctx.strokeStyle = _color;
		ctx.beginPath();
		ctx.ellipse(
			position.value[0],
			position.value[1],
			radius,
			radius,
			0,
			0,
			2 * Math.PI
		);
		ctx.closePath();
		ctx.stroke();
	}

	this.drawBox = function(_box, _color = "#f00") {
		let points = _box.getPoints();
		for (let p = 0; p < points.length; p++) 
		{
			points[p] = this.camera.worldPosToCanvasPos(points[p]);
		}

		ctx.strokeStyle = _color;
		ctx.beginPath();
		ctx.moveTo(points[0].value[0], points[0].value[1]);
		ctx.lineTo(points[1].value[0], points[1].value[1]);
		ctx.lineTo(points[2].value[0], points[2].value[1]);
		ctx.lineTo(points[3].value[0], points[3].value[1]);
		ctx.lineTo(points[0].value[0], points[0].value[1]);
		ctx.closePath();
		ctx.stroke();
	}






	this.drawClientCursors = function() {
		const size = 20;
		for (let i = 0; i < Server.clients.length; i++)
		{
			if (Server.clients[i].isSelf) continue;
			let mousePosition = Server.clients[i].mousePosition.copy();
			let pos = this.camera.worldPosToCanvasPos(mousePosition).value;
			
			ctx.strokeStyle = Server.clients[i].color;
			ctx.moveTo(pos[0], pos[1] - size / 2);
			ctx.lineTo(pos[0], pos[1] + size / 2);

			ctx.moveTo(pos[0] - size / 2, pos[1]);
			ctx.lineTo(pos[0] + size / 2, pos[1]);
			ctx.stroke();

			ctx.fillStyle = Server.clients[i].color;
			ctx.fillText(Server.clients[i].id, pos[0], pos[1] + size);
			ctx.fill();
		}
	}
}









function RenderEngine_Camera() {
	this.size = new Vector([800, 600]); // canvas
	
	this.zoom = 1000; // percent of the camsize you can see
	this.position = PhysicsEngine.world.size.copy().scale(.5);

	let followEntity = false;
	this.follow = function(_entity) {
		followEntity = _entity;
		if (!followEntity) return;
		
		this.panTo(followEntity.position.copy());
	}

	this.update = function() {
		if (!followEntity || panning) return;
		this.position = followEntity.position.copy();
	}


	this.getWorldProjectionSize = function() {
		return this.size.copy().scale(this.zoom);
	}

	this.worldPosToCanvasPos = function(_position) {
		let rPos = this.position.copy().add(this.getWorldProjectionSize().scale(-.5)).difference(_position);
		return rPos.scale(1 / this.zoom);
	}
	this.canvasPosToWorldPos = function(_position) {
		let rPos = _position.copy().scale(this.zoom).add(this.getWorldProjectionSize().scale(-.5));
		return this.position.copy().add(rPos); 
	}
	
	this.inView = function(_particle) {
		let projSize = this.getWorldProjectionSize();
		let dPos = this.position.difference(_particle.position);
		if (
			dPos.value[0] < -_particle.shape.shapeRange - projSize.value[0] * .5 || 
			dPos.value[1] < -_particle.shape.shapeRange - projSize.value[1] * .5) return false;
		if (dPos.value[0] > projSize.value[0] * .5 + _particle.shape.shapeRange || 
			dPos.value[1] > projSize.value[1] * .5 + _particle.shape.shapeRange) return false;
		return true;
	}


	this.zoomTo = function(_targetValue) {
		Animator.animateValue({
			start: this.zoom,
			end: _targetValue,
			frames: 100,
			callback: function(_value) {
				RenderEngine.camera.zoom = _value;
			}
		});
	}


	let panning = false;
	this.panTo = function(_endCoords) {
		panning = true;
		const cameraSpeed = 200;
		let delta = this.position.difference(_endCoords);
		let startPosition = this.position;
		Animator.animateValue({
			start: 0,
			end: 1,
			frames: delta.getLength() / cameraSpeed,
			callback: function(_value, _percentage) {
				if (_value >= .9) panning = false;
				let dpos = delta.copy().scale(_value);
				RenderEngine.camera.position = startPosition.copy().add(dpos);
			}
		});
	}
}