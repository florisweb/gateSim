function Renderer_Camera() {
	this.size = new Vector(800, 600);
	
	this.zoom = 1; // percent of the camsize you can see
	this.position = World.size.copy(0).scale(.5);
	let maxZoom = Infinity;


	this.getWorldProjectionSize = function() {
		return this.size.copy().scale(this.zoom);
	}

	this.worldPosToCanvPos = function(_position) {
		let topLeftPosition = this.position.copy().add(this.getWorldProjectionSize().scale(-.5));
		let rPos = topLeftPosition.difference(_position);
		return rPos.scale(1 / this.zoom);
	}
	this.canvPosToWorldPos = function(_position) {		
		let rPos = _position.copy().scale(this.zoom).add(this.getWorldProjectionSize().scale(-.5));
		return this.position.copy().add(rPos); 
	}

	this.setZoom = function(_zoom) {
		this.zoom = _zoom;
		if (this.zoom < .1) this.zoom = .1;
		if (this.zoom > maxZoom) this.zoom = maxZoom;
	}


	this.onResize = function() {
		this.size = new Vector(
    		worldCanvas.width,
    		worldCanvas.height
  		);
  		
  		let verticalMaxZoom = World.size.value[1] / this.size.value[1];
  		let horizontalMaxZoom = World.size.value[0] / this.size.value[0];
  		maxZoom = horizontalMaxZoom > verticalMaxZoom ? horizontalMaxZoom : verticalMaxZoom;

  		this.setZoom(this.zoom);
	}
}




window.onresize = function() {
  worldCanvas.width = worldCanvas.offsetWidth;
  worldCanvas.height = worldCanvas.offsetHeight;
  Renderer.camera.onResize();
}





