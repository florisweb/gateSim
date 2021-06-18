window.debugging = false;

function _World() {
  this.size = new Vector(800, 600);


  this.setup = function() {
    window.onresize();
    this.clear();

    this.update();
  }

  this.clear = function(inputCount = 2, outputCount = 2) {
    let inputs = [];
    let outputs = [];
    for (let i = 0; i < inputCount; i++) inputs.push({name: 'input ' + i});
    for (let i = 0; i < outputCount; i++) outputs.push({name: 'output ' + i});

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


  this.run = function() {
    for (let input of this.curComponent.inputs)
    {
      input.run(0, false);
    }
  }

  this.update = function() {
    // this.run();
    Builder.update();

    setTimeout(function () {
      World.update();
    }, 10);
  }
}
