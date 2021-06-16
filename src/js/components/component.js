
function NandGateComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Nand gate',
		id: id,
		componentId: 'nandgate',
		inputs: [{name: 'input 1'}, {name: 'input 2'}],
		outputs: [{name: 'output'}],
	});
	
	this.addInverter = function() {
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
}

function InverterComponent({position, id}) {
	Component.call(this, {
		position: position,
		name: 'Inverter',
		id: id,
		componentId: 'inverter',
		inputs: [{name: 'input 1'}],
		outputs: [{name: 'output'}],
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

  this.addComponent = function() {};
}































function BaseComponent({name, id, componentId, inputs = [], outputs = []}) {
	let This 					= this;
	this.id 					= id ? id : newId();

	this.type 				= 'BaseComponent';
	this.name 				= name;
	this.componentId 	= componentId;


	this.inputs = inputs.map(function (item, i) {
		return new InOutput(item, This, i, true);
	});
	this.outputs = outputs.map(function (item, i) {
		return new InOutput(item, This, i, false);
	});

	this.content = [];

	this.activate = function() {};

	this.addComponent = function(_component) {
		_component.parent = this;
		_component.activate();
		this.content.push(_component);
	}

	this.getComponentById = function(_id) {
		if (this.id == _id) return this;

		for (let component of this.content)
		{
			if (component.id == _id) return component;
			let nestedComponent = component.getComponentById(_id);
			if (!nestedComponent) continue;
			return nestedComponent;
		}
		return false;
	}

	this.remove = function() {
		for (let item of this.content) item.remove();
		Builder.unregister(this.id);

		for (let node of this.inputs) 
		{
			for (let i = node.toLines.length - 1; i >= 0; i--) node.toLines[i].remove();
		}
		for (let node of this.outputs) 
		{
			for (let i = node.fromLines.length - 1; i >= 0; i--) node.fromLines[i].remove();
		}


		for (let i = 0; i < this.parent.content.length; i++)
		{
			if (this.parent.content[i].id != this.id) continue;
			this.parent.content.splice(i, 1);
		}
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




function Component({position, name, id, componentId, inputs, outputs, content}) {
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


	this.export = function() {
		let obj = {
			position: 		this.position.value, 
			name: 				this.name, 
			id: 					this.id, 
			componentId: 	this.componentId, 
			inputs: 			this.inputs.map(input => input.export()), 
			outputs: 			this.outputs.map(output => output.export()), 
			content: 			this.content.map(item => item.export()), 
		}
		return obj;
	}
}







function LineComponent({from, to}) {
	BaseComponent.call(this, {
		name: 'line',
		inputs: [],
		outputs: [],
	});
	this.type = 'line';

	
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



	this.activate = function() {
		if (this.from) this.from.fromLines.push(this);
		if (this.to) this.to.toLines.push(this);
	}


	this.remove = function() {
		for (let i = 0; i < this.parent.content.length; i++)
		{
			if (this.parent.content[i].id != this.id) continue;
			this.parent.content.splice(i, 1);
		}
		
		for (let i = 0; i < this.to.toLines.length; i++)
		{
			if (this.to.toLines[i].id != this.id) continue;
			this.to.toLines.splice(i, 1);
		}
		for (let i = 0; i < this.from.fromLines.length; i++)
		{
			if (this.from.fromLines[i].id != this.id) continue;
			this.from.fromLines.splice(i, 1);
		}

		this.to.run();
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


	this.export = function() {
		let item = {
			name: this.name,
			type: this.type,
			from: {
				parentId: 	this.from.parent.id,
				index:  		this.from.index,
				isInput: 		this.from.isInput
			},
			to: {
				parentId: 	this.to.parent.id,
				index: 			this.to.index,
				isInput: 		this.to.isInput
			}  
		}
		return item;
	}
} 







function Node({turnedOn}) {
	this.id 				= Symbol();
	this.turnedOn 	= turnedOn;
	this.toLines 		= [];
	this.fromLines 	= [];

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


	this.onclick = function() {};

	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		let distance = delta.getSquaredLength();
		return distance < Math.pow(nodeRadius, 2);
	}
}



function InOutput({name, turnedOn}, _parent, _index, _isInput = true) {
	Node.call(this, {turnedOn: turnedOn});
	this.index = _index;
	this.name = name;
	this.isInput = _isInput;
	this.parent = _parent;

	this.getPosition = function() {
		let items = this.isInput ? this.parent.inputs : this.parent.outputs;
		let y = this.parent.size.value[1] / 2 - (items.length / 2 - this.index - .5) * (nodeRadius * 2 + inOutPutMargin * 2);
		return this.parent.getPosition().copy().add(new Vector(this.parent.size.value[0] * !this.isInput, y));
	}

	this.export = function() {
		let item = {
			name: this.name,
			turnedOn: this.turnedOn
		}
		return item;
	}
}

























function WorldInput({name, turnedOn}, _parent, _index) {
	InOutput.call(this, {name, turnedOn}, _parent, _index, true);
	this.isWorldInput = true;

	let activationLine = new LineComponent({
      from: false,
      to: this,
    })

	this.toLines.push(activationLine);


	this.setStatus = function(_status) {
		activationLine.turnedOn = _status;
	}
	this.onclick = function() {
		this.setStatus(!activationLine.turnedOn);
	}
}

function WorldOutput({name, turnedOn}, _parent, _index) {
	InOutput.call(this, {name, turnedOn}, _parent, _index, false);
	this.isWorldInput = true;
}


function CurComponent({inputs, outputs}) {
	let This = this;
	Component.call(this, { 
		position: 		new Vector(0, 0), 
		name: 				'CurComponent', 
		id: 					newId(),
		componentId: 	'worldComponent', 
		inputs: 			inputs, 
		outputs: 			outputs, 
	});

	this.size = World.size;
	this.inputs = inputs.map(function (item, i) {
		return new WorldInput(item, This, i);
	});
	this.outputs = outputs.map(function (item, i) {
		return new WorldOutput(item, This, i);
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




