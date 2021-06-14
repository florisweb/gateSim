
function _World() {
  this.size = new Vector(800, 600);

  this.setup = function(_inputs, _outputs) {
    window.onresize();

    this.curComponent = new CurComponent({
      name: 'CurComponent', 
      inputs: _inputs, 
      outputs: _outputs, 
      contents: []
    });

    this.update();
  }

  this.update = function() {
     
     setTimeout(function () {
      World.update();
    }, 10);
  }
}


window.onresize = function() {
  worldCanvas.width = worldCanvas.offsetWidth;
  worldCanvas.height = worldCanvas.offsetHeight;
  Renderer.camera.size = new Vector(
    worldCanvas.width,
    worldCanvas.height
  );
}





