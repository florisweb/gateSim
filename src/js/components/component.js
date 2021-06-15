



function InverterComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Inverter',
		id: id,
		componentId: 'inverter',
		inputs: [{name: 'input 1'}, {name: 'input 2'}],
		outputs: [{name: 'output'}],
		content: []
	});

	// this.run = function() {
	// 	this.outputs[0].turnedOn = !this.inputs[0].turnedOn && !this.inputs[1].turnedOn;
	// }
}









function OrGateComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Inverter',
		id: id,
		componentId: 'inverter',
		inputs: [{name: 'input 1'}, {name: 'input 2'}],
		outputs: [{name: 'output'}],
		content: []
	});

	this.addComponent(new LineComponent({
      from: this.inputs[0],
      to: this.outputs[0],
    }));
    
    this.addComponent(new LineComponent({
      from: this.inputs[1],
      to: this.outputs[0],
    }));
}


























function BaseComponent({name, id, componentId, inputs = [], outputs = [], content = []}) {
	let This 		= this;
	this.type 		= 'BaseComponent';
	this.name 		= name;
	this.id 		= id ? id : newId();
	this.componentId = componentId;


	this.inputs = inputs.map(function (item, i) {
		return new InOutput(item, This, i, true);
	});
	this.outputs = outputs.map(function (item, i) {
		return new InOutput(item, This, i, false);
	});
	this.content = content;

	this.addComponent = function(_component) {
		this.content.push(_component);
	}
}


function Component({position, name, id, componentId, inputs, outputs, content}) {
	BaseComponent.call(this, ...arguments);
	this.type = 'component';
	this.position = position;

	this.size = new Vector(0, 0);
	let maxPorts = this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length;
	this.size = new Vector(100, maxPorts * 40)


	this.fillColor = '#555';

	this.draw = function() {
		Renderer.drawLib.drawRect({
			position: position,
			diagonal: this.size,
			fillColor: this.fillColor,
			strokeColor: '#444'
		});

		Renderer.drawInOutPutArray({
			position: this.position,
			items: this.inputs,
			availableHeight: this.size.value[1],
			isInputArray: true,
		});
		Renderer.drawInOutPutArray({
			position: this.position.copy().add(new Vector(this.size.value[0], 0)),
			items: this.outputs,
			availableHeight: this.size.value[1],
			isInputArray: false,
		});


		for (let component of this.content) component.draw();
	}
}



function InOutput({name, turnedOn}, _parent, _index, _isInput = true) {
	this.index = _index;
	this.name = name;
	this.isInput = _isInput;
	this.turnedOn = turnedOn;
	this.parent = _parent;
	this.toLines = [];
	this.fromLines = [];

	this.getPosition = function() {
		let items = this.isInput ? this.parent.inputs : this.parent.outputs;
		let y = this.parent.size.value[1] / 2 - (items.length / 2 - this.index - .5) * (inOutPutRadius * 2 + inOutPutMargin * 2);
		return this.parent.position.copy().add(new Vector(this.parent.size.value[0] * !this.isInput, y));
	}

	this.run = function(_index) {
		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.turnedOn) continue;
			this.turnedOn = true;
			break;
		}
		
		if (debugging) console.log(_index, 'Run ' + (_isInput ? 'input' : 'output')  + ' ' + this.index + " of " + this.parent.name + " status: " + this.turnedOn);
		for (let line of this.fromLines) line.run(_index);
	}
}



function WorldInput({name, turnedOn}, _parent, _index,) {
	InOutput.call(this, {name, turnedOn}, _parent, _index, true);

	let activationLine = new LineComponent({
      from: false,
      to: this,
    })

	this.toLines.push();


	this.setStatus = function(_status) {
		activationLine.turnedOn = _status;
	}


}





function LineComponent({id, from, to}) {
	BaseComponent.call(this, {
		id: id,
		name: 'line',
		inputs: [],
		outputs: [],
		content: [],
	});
	RunComponent.call(this, {
		from: from,
		to: to
	});


	this.type = 'line';
	if (this.from) this.from.fromLines.push(this);
	if (this.to) this.to.toLines.push(this);

	this.draw = function() {
		Renderer.drawLib.ctx.lineWidth = 2;
		Renderer.drawLib.drawLine({
			startPosition: this.from.getPosition(),
			endPosition: this.to.getPosition(),
			color: this.from.turnedOn ? '#f00' : '#aaa'
		});
		Renderer.drawLib.ctx.lineWidth = 1;
	}
} 




function RunComponent({from, to}) {
	this.from = from;
	this.to = to;
	this.runIndex = -1;

	this.turnedOn = false;

	this.run = function(_index) {
		this.turnedOn = this.from.turnedOn;
		if (debugging) console.log('Run line from ' + this.from.parent.name + " to " + this.to.parent.name, _index);
		this.runIndex = _index;
		this.to.run(_index + 1);
	}
}












function CurComponent({inputs, outputs}) {
	let This = this;
	Component.call(this, { 
		position: new Vector(0, 0), 
		name: 'CurComponent', 
		id: 'worldComponent',
		componentId: 'worldComponent', 
		inputs: inputs, 
		outputs: outputs, 
		content: [],
	});
	this.size = World.size;
	this.inputs = inputs.map(function (item, i) {
		return new WorldInput(item, This, i);
	});

	this.fillColor = 'rgba(0, 0, 0, 0)';
}






