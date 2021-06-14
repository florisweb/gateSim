
function _World() {
  this.size = new Vector(800, 600);

  this.setup = function(_inputs, _outputs) {
    window.onresize();
    console.log(arguments);
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
