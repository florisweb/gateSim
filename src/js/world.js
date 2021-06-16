window.debugging = false;

function _World() {
  this.size = new Vector(800, 600);


  this.setup = function(_inputs, _outputs) {
    window.onresize();
    this.curComponent = new CurComponent({
      inputs: _inputs, 
      outputs: _outputs, 
    });

    this.update();
  }


  this.import = function(_data) {
    Builder.list = [];
    let component = ComponentManager.importComponent(_data);
    this.curComponent = component;
  }

  this.packageComponent = function() {
    let data            = this.curComponent.export();
    data.name           = 'new name';
    data.componentId    = newId();
    return data;
  }


  this.run = function() {
    for (let input of this.curComponent.inputs)
    {
      input.run(0);
    }
  }

  this.update = function() {
    this.run();
    Builder.update();

    setTimeout(function () {
      World.update();
    }, 10);
  }
}
