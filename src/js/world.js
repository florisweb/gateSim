
function _World() {
  this.size = new Vector(800, 600);

  this.grid = new function() {
    this.gridSize = 25;
    this.snapToGrid = function(_position) {
      return new Vector(
        Math.round(_position.value[0] / this.gridSize) * this.gridSize,
        Math.round(_position.value[1] / this.gridSize) * this.gridSize,
      );
    }
  }



  this.setup = function() {
    window.onresize();
    this.clear();

    this.update();
  }

  this.clear = function(inputCount = 2, outputCount = 2) {
    HitBoxManager.clear();
    let inputs = [];
    let outputs = [];
    for (let i = 0; i < inputCount; i++) inputs.push({name: ''});
    for (let i = 0; i < outputCount; i++) outputs.push({name: ''});

    Builder.list = [];
    this.curComponent = new CurComponent({
      inputs: inputs, 
      outputs: outputs, 
    });
  }


  this.import = function(_data) {
    Builder.list = [];
    let component = ComponentManager.importComponent(_data, true);
    this.curComponent = component;
  }


  this.update = function() {
    Builder.update();

    setTimeout(function () {
      World.update();
    }, 10);
  }
}
