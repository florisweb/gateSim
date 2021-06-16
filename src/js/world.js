window.debugging = false;

function _World() {
  this.size = new Vector(800, 600);


  this.setup = function(_inputs, _outputs) {
    window.onresize();
    this.curComponent = new CurComponent({
      inputs: _inputs, 
      outputs: _outputs, 
    });


    let nandGate = new NandGateComponent({position: new Vector(400, 300)});


    this.curComponent.addComponent(nandGate);

    // this.curComponent.addComponent(new LineComponent({
    //   from: this.curComponent.inputs[0],
    //   to: nandGate.inputs[0],
    // }));
    // this.curComponent.addComponent(new LineComponent({
    //   from: this.curComponent.inputs[1],
    //   to: nandGate.inputs[1],
    // }));
    // this.curComponent.addComponent(new LineComponent({
    //   from: nandGate.outputs[0],
    //   to: this.curComponent.outputs[0],
    // }));



    // let newComponent = new Component({
    //   name: 'And Gate',
    //   componentId: 1,
    //   id: 'component1',

    //   position: new Vector(400, 300),

    //   inputs: [{name: 'input 1'}, {name: 'input 2'}],
    //   outputs: [{name: 'output 1'}],
    //   content: [],
    // });
    // this.curComponent.addComponent(newComponent);

    // let inverter1 = new InverterComponent({
    //   id: 'component2',
    //   position: new Vector(200, 100)
    // });
    // this.curComponent.addComponent(inverter1);


    // let inverter2 = new InverterComponent({
    //   id: 'component2',
    //   position: new Vector(200, 300)
    // });
    // this.curComponent.addComponent(inverter2);


    // this.curComponent.addComponent(new LineComponent({
    //   from: this.curComponent.inputs[0],
    //   to: newComponent2.inputs[0],
    // }));

    // this.curComponent.addComponent(new LineComponent({
    //   from: this.curComponent.inputs[0],
    //   to: newComponent.inputs[1],
    // }));

    // this.curComponent.addComponent(new LineComponent({
    //   from: newComponent2.outputs[0],
    //   to: newComponent.inputs[0],
    // }));

    this.update();
  }


  this.import = function(_data) {
    Builder.list = [];
    let component = ComponentManager.importComponent(_data);
    this.curComponent = component;
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
