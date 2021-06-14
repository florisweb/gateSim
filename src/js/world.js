
function _World() {
  this.size = new Vector(800, 600);

  this.setup = function(_inputs, _outputs) {
    window.onresize();
    this.curComponent = new CurComponent({
      inputs: _inputs, 
      outputs: _outputs, 
    });


    let orGate = new OrGateComponent({position: new Vector(400, 300), id: 'test'});
    this.curComponent.addComponent(orGate);

    this.curComponent.addComponent(new LineComponent({
      from: this.curComponent.inputs[0],
      to: orGate.inputs[0],
    }));
    this.curComponent.addComponent(new LineComponent({
      from: this.curComponent.inputs[1],
      to: orGate.inputs[1],
    }));
    this.curComponent.addComponent(new LineComponent({
      from: orGate.outputs[0],
      to: this.curComponent.outputs[0],
    }));
    
    


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

  this.update = function() {
    for (let input of this.curComponent.inputs)
    {
      for (let line of input.lines) line.run();
    }
   

    setTimeout(function () {
      World.update();
    }, 10);
  }
}
