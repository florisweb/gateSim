
function NandGateComponent({position, id}) {
	let This = this;
	Component.call(this, {
		position: position,
		name: 'Nand gate',
		id: id,
		componentId: 'nandgate',
		inputs: [{name: 'input 1'}, {name: 'input 2'}],
		outputs: [{name: 'output'}],
	});

  	this.inputs[0].run = this.inputs[1].run = function(_index) {
  		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.from.turnedOn) continue;
			this.turnedOn = true;
			break;
		}

  		this.parent.outputs[0].turnedOn = !(this.parent.inputs[0].turnedOn && this.parent.inputs[1].turnedOn);
  		for (let line of this.parent.outputs[0].fromLines) line.to.run(_index + 1);
  	};
}





























function BaseComponent({name, id, position}) {
	this.id 	= id ? id : newId();

	this.type 		= 'BaseComponent';
	this.name 		= name;
	this.position 	= position;

	this.activate = function() {};
	this.getPosition = function() {
		let parentPos = new Vector(0, 0);
		if (this.parent) parentPos = this.parent.getPosition();
		return this.position.copy().add(parentPos);
	}
}


function Component({position, name, id, componentId, inputs, outputs, content}) {
	let This = this;
	BaseComponent.call(this, ...arguments);

	this.type = 'component';
	this.componentId = componentId;

	this.inputs = inputs.map(function (item, i) {
		return new InOutput(item, This, i, true);
	});
	this.outputs = outputs.map(function (item, i) {
		return new InOutput(item, This, i, false);
	});

	this.content = [];

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


		for (let input of this.inputs) input.draw();
		for (let output of this.outputs) output.draw();
		

		// Renderer.drawInOutPutArray({
		// 	position: position,
		// 	items: this.inputs,
		// 	availableHeight: this.size.value[1],
		// 	isInputArray: true,
		// });
		// Renderer.drawInOutPutArray({
		// 	position: position.copy().add(new Vector(this.size.value[0], 0)),
		// 	items: this.outputs,
		// 	availableHeight: this.size.value[1],
		// 	isInputArray: false,
		// });

		Renderer.drawLib.drawCenteredText({
			text: this.name,
			position: this.getPosition().copy().add(this.size.copy().scale(.5)),
			fontSize: 15,
			color: '#fff'
		})


		for (let component of this.content) component.draw();
	}


	// this.export = function() {
	// 	let obj = {
	// 		position: 		this.position.value, 
	// 		name: 			this.name, 
	// 		id: 			this.id, 
	// 		componentId: 	this.componentId, 
	// 		inputs: 		this.inputs.map(input => input.export()), 
	// 		outputs: 		this.outputs.map(output => output.export()), 
	// 		content: 		this.content.map(item => item.export()), 
	// 	}
	// 	return obj;
	// }

	this.export = function(_asReference = false) {
		if (_asReference) 
		{
			return {
				position: 		this.position.value, 
				id: 			this.id, 
				componentId: 	this.componentId
			}
		}

		return {
			position: 		this.position.value, 
			name: 			this.name, 
			id: 			this.id, 
			componentId: 	this.componentId, 
			inputs: 		this.inputs.map(input => input.export()), 
			outputs: 		this.outputs.map(output => output.export()), 
			content: 		this.content.map(item => item.export(true)), 
		}
	}


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
			if (component.type == 'line') continue;
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

	this.getDepth = function() {
		if (!this.parent) return 0;
		return this.parent.getDepth() + 1;
	}
}







function LineComponent({from, to}) {
	BaseComponent.call(this, {
		name: 'line',
	});
	this.type = 'line';
	
	this.from = from;
	this.to = to;

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
		if (this.parent && this.parent.getDepth() + 1 > Renderer.maxRenderDepth) return;

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
	this.isNode = true;
	this.getDepth = function() {
		return this.parent.getDepth();
	}
	CircularHitBoxComponent.call(this, {radius: nodeRadius});
	ClickComponent.call(this);
	this.onclick = function() {};


	this.id 		= Symbol();
	this.turnedOn 	= turnedOn;
	this.toLines 	= [];
	this.fromLines 	= [];

	this.run = function(_index, _fullRun = false) {
		let prevStatus = this.turnedOn;
		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.from.turnedOn) continue;
			this.turnedOn = true;
			break;
		}

		if (debugging) console.log(_index, 'Run node status: ' + this.turnedOn);
		if (prevStatus == this.turnedOn && !_fullRun) return;

		for (let line of this.fromLines) line.to.run(_index + 1, _fullRun)
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
		}
		return item;
	}

	this.draw = function() {
		Renderer.drawInOutPut({
			position: this.getPosition(),
			name: this.name,
			isInput: this.isInput,
			turnedOn: this.turnedOn
		});
	}
}











function BuildComponent() {
	DragComponent.call(this);
	ClickComponent.call(this);
	this.selected = false;

	this.onclick = function() {
		this.selected = true;
	}
}

function ClickComponent() {
	this.clickable = true;
	this.onclick = function() {console.warn('[!] You forgot to add an onclick-handler', this);}
}

function DragComponent() {
	HitBoxComponent.call(this, {hitBox: this.size});
	this.draggable = true;
	this.drag = function(_delta) {
		this.position.add(_delta.copy().scale(-1));
	}
	Builder.register(this);
}


function HitBoxComponent({hitBox}) {
	let HitBox = hitBox.copy();
	this.area = HitBox.value[0] * HitBox.value[1];

	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		if (delta.value[0] > HitBox.value[0] || delta.value[0] < 0) return false;
		if (delta.value[1] > HitBox.value[1] || delta.value[1] < 0) return false;

		return true;
	}

	HitBoxManager.register(this);
}

function CircularHitBoxComponent({radius}) {
	HitBoxComponent.call(this, {hitBox: new Vector(0, 0)});
	let Radius = radius;
	this.area = Math.PI * Math.pow(Radius, 2);
	
	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		let distance = delta.getSquaredLength();
		return distance < Math.pow(Radius, 2);
	}
}
































function WorldInput({name, turnedOn}, _parent, _index) {
	let This = this;
	InOutput.call(this, {name, turnedOn}, _parent, _index, true);
	this.isWorldInput = true;
	this.setStatus = function(_status) {
		this.turnedOn = _status;
	}

	this.run = function() {
		for (let line of this.fromLines) line.to.run(1);
	}

	let drawNode = this.draw;
	this.draw = function() {
		drawNode.call(this);
		this.toggleButton.draw();
	}

	this.toggleButton = new function() {
		const width = 45;
		const height = 20;
		this.getDepth = function() {return 0;}

		HitBoxComponent.call(this, {hitBox: new Vector(width, height)});
		ClickComponent.call(this);

		this.onclick = function() {
			This.setStatus(!This.turnedOn);
			This.run();
		}
		
		this.getPosition = function() {
			return This.getPosition().copy().add(new Vector(-width - nodeRadius - inOutPutMargin, -height / 2));
		}

		this.draw = function() {
			let position = this.getPosition();
			Renderer.drawLib.drawRect({
				position: position,
				diagonal: new Vector(width, height),
				strokeColor: '#222',
				fillColor: '#444'
			});
			Renderer.drawLib.drawText({
				text: 'Toggle',
				position: position.copy().add(new Vector(5, height * .7)),
				color: '#ddd',
				fontSize: 12
			});
		}
	}
}




function WorldOutput({name, turnedOn}, _parent, _index) {
	InOutput.call(this, {name, turnedOn}, _parent, _index, false);
	this.isWorldOutput = true;
}


function CurComponent({inputs, outputs, id}) {
	let This = this;
	Component.call(this, { 
		position: 		new Vector(0, 0), 
		name: 			'', 
		id: 			id,
		componentId: 	'worldComponent', 
		inputs: 		inputs, 
		outputs: 		outputs,
	});
	this.draggable = false;
	this.onclick = function() {};
	
	this.size = World.size;
	this.inputs = inputs.map(function (item, i) {
		return new WorldInput(item, This, i);
	});
	this.outputs = outputs.map(function (item, i) {
		return new WorldOutput(item, This, i);
	});


	this.fillColor = 'rgba(0, 0, 0, 0)';
}














