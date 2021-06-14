
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
		// this.drawLib.drawWorldGrid();

		requestAnimationFrame(function () {Renderer.update()});
	}
}

