



function NandGateComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Nand gate',
		id: id,
		componentId: 'nandgate',
		inputs: [{name: 'input 1'}, {name: 'input 2'}],
		outputs: [{name: 'output'}],
		content: []
	});
	
	let inverter = new InverterComponent({position: new Vector(0, 20)});
  this.addComponent(inverter);
	this.addComponent(new LineComponent({
   	from: this.inputs[0],
    to: inverter.inputs[0],
  }));

	this.addComponent(new LineComponent({
   	from: this.inputs[1],
    to: inverter.inputs[0],
  }));

  this.addComponent(new LineComponent({
   	from: inverter.outputs[0],
    to: this.outputs[0],
  }));
}

function InverterComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Inverter',
		id: id,
		componentId: 'inverter',
		inputs: [{name: 'input 1'}],
		outputs: [{name: 'output'}],
		content: []
	});


	let line = new LineComponent({
    from: this.inputs[0],
    to: this.outputs[0],
  });

  line.run = function(_index) {
		this.turnedOn = !this.from.turnedOn;
		this.runIndex = _index;
		this.to.run(_index + 1);
  }
  this.addComponent(line);
}































function BaseComponent({name, id, componentId, inputs = [], outputs = [], content = []}, _parent) {
	let This 		= this;
	this.parent = _parent;

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

	this.activate = function() {};

	this.addComponent = function(_component) {
		_component.parent = this;
		_component.activate();
		this.content.push(_component);
	}

	this.getPosition = function() {
		let parentPos = new Vector(0, 0);
		if (this.parent) parentPos = this.parent.getPosition();
		return this.position.copy().add(parentPos);
	}
	this.getDepth = function() {
		if (!this.parent) return 0;
		return this.parent.getDepth() + 1;
	}
}




function Component({position, name, id, componentId, inputs, outputs, content}, _parent) {
	BaseComponent.call(this, ...arguments);

	this.type = 'component';
	this.position = position;

	this.size = new Vector(0, 0);
	let maxPorts = this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length;
	this.size = new Vector(100, maxPorts * 40);

	BuildComponent.call(this);



	this.fillColor = '#555';

	this.draw = function() {
		if (this.getDepth() > Renderer.maxRenderDepth) return;

		let position = this.getPosition();
		Renderer.drawLib.drawRect({
			position: position,
			diagonal: this.size,
			fillColor: this.selected ? '#557' : this.fillColor,
			strokeColor: this.selected ? '#33f' : '#444'
		});

		Renderer.drawInOutPutArray({
			position: position,
			items: this.inputs,
			availableHeight: this.size.value[1],
			isInputArray: true,
		});
		Renderer.drawInOutPutArray({
			position: position.copy().add(new Vector(this.size.value[0], 0)),
			items: this.outputs,
			availableHeight: this.size.value[1],
			isInputArray: false,
		});


		for (let component of this.content) component.draw();
	}
}



function InOutput({name, turnedOn}, _parent, _index, _isInput = true) {
	Node.call(this, {turnedOn: turnedOn});
	this.index = _index;
	this.name = name;
	this.isInput = _isInput;;
	this.parent = _parent;

	this.getPosition = function() {
		let items = this.isInput ? this.parent.inputs : this.parent.outputs;
		let y = this.parent.size.value[1] / 2 - (items.length / 2 - this.index - .5) * (nodeRadius * 2 + inOutPutMargin * 2);
		return this.parent.getPosition().copy().add(new Vector(this.parent.size.value[0] * !this.isInput, y));
	}
}



function Node({turnedOn}) {
	this.turnedOn = turnedOn;
	this.toLines = [];
	this.fromLines = [];

	this.run = function(_index) {
		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.turnedOn) continue;
			this.turnedOn = true;
			break;
		}
		
		if (debugging) console.log(_index, 'Run node status: ' + this.turnedOn);
		for (let line of this.fromLines) line.run(_index);
	}



	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		let distance = delta.getSquaredLength();
		return distance < Math.pow(nodeRadius, 2);
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

	this.activate = function() {
		if (this.from) this.from.fromLines.push(this);
		if (this.to) this.to.toLines.push(this);
	}

	this.draw = function() {
		let highestDepth = this.to.parent.getDepth() > this.from.parent.getDepth() ? this.to.parent.getDepth() : this.from.parent.getDepth();
		if (highestDepth > Renderer.maxRenderDepth) return;

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




















function WorldInput({name, turnedOn}, _parent, _index,) {
	InOutput.call(this, {name, turnedOn}, _parent, _index, true);

	let activationLine = new LineComponent({
      from: false,
      to: this,
    })

	this.toLines.push(activationLine);


	this.setStatus = function(_status) {
		activationLine.turnedOn = _status;
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

















function BuildComponent() {
	DragComponent.call(this);
	this.selected = false;

	this.onclick = function() {
		this.selected = true;
	}
}








function DragComponent() {
	this.draggable = true;

	this.hitBox = this.size.copy();

	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		if (delta.value[0] > this.hitBox.value[0] || delta.value[0] < 0) return false;
		if (delta.value[1] > this.hitBox.value[1] || delta.value[1] < 0) return false;

		return true;
	}


	this.drag = function(_delta) {
		this.position.add(_delta.copy().scale(-1));
	}
	Builder.register(this);
}




