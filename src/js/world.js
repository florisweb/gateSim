
function _World() {
  this.size = new Vector(800, 600);

  this.setup = function(_inputs, _outputs) {
    window.onresize();
    this.curComponent = new CurComponent({
      inputs: _inputs, 
      outputs: _outputs, 
    });

    let newComponent = new Component({
      name: 'And Gate',
      componentId: 1,
      id: 'component1',

      position: new Vector(300, 200),

      inputs: [{name: 'input 1'}, {name: 'input 2'}],
      outputs: [{name: 'output 1'}],
      content: [],
    });
    
    this.curComponent.addComponent(newComponent);
    this.curComponent.addComponent(new LineComponent({
      from: this.curComponent.inputs[0],
      to: newComponent.inputs[0],
    }));

    this.update();
  }

  this.update = function() {
     
     setTimeout(function () {
      World.update();
    }, 10);
  }
}
