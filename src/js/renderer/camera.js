function Renderer_Camera() {
	this.size = new Vector(800, 600); // canvas
	
	this.zoom = 1; // percent of the camsize you can see
	this.position = World.size.copy(0).scale(.5);


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
}



