
window.debug = false;


const NandGateComponentId = -1;
function NandGateComponent({position, id}) {
	let This = this;
	Component.call(this, {
		position: position,
		name: 'Nand gate',
		id: id,
		componentId: NandGateComponentId,
		inputs: [{name: ''}, {name: ''}],
		outputs: [{name: '', turnedOn: true}],
	});
	
  	this.inputs[0].run = this.inputs[1].run = async function(_index, _curRunID, _fullRun) {
  		if (Runner.activated) return;
  		this.prevState = this.turnedOn;
  		if (this.lastRunId == _curRunID) return Runner.addLoopedNode(this);
		this.lastRunId = _curRunID;


  		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.from.turnedOn) continue;
			this.turnedOn = true;
			break;
		}
		if (this.prevState == this.turnedOn && !_fullRun) return;
  		this.parent.outputs[0].turnedOn = !(this.parent.inputs[0].turnedOn && this.parent.inputs[1].turnedOn);  		
  		// await Runner.awaitNextStep();
  		for (let line of this.parent.outputs[0].fromLines) line.to.run(_index + 1, _curRunID, _fullRun);
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
	this.activate = function() {
		this.enableHitBox();
		for (let input of this.inputs) input.enableHitBox();
		for (let output of this.outputs) output.enableHitBox();
	}

	this.type = 'component';
	this.componentId = componentId;

	this.inputs = inputs.map(function (item, i) {
		if (This.isWorldComponent) return new WorldInput(item, This, i);
		return new InOutput(item, This, i, true);
	});
	this.outputs = outputs.map(function (item, i) {
		if (This.isWorldComponent) return new WorldOutput(item, This, i);
		return new InOutput(item, This, i, false);
	});

	this.content = [];

	this.size = new Vector(0, 0);
	let maxPorts = this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length;
	const margin = 5;
	let width = Renderer.drawLib.getTextBoundingBox({text: this.name, fontSize: 15}).value[0] + 2 * (margin + nodeRadius + inOutPutMargin);
	this.size = new Vector(
		width > 250 ? 250 : width,
		maxPorts * (nodeRadius + inOutPutMargin) * 2 + margin * 2
	);



	BuildComponent.call(this);
	this.fillColor = '#555';

	this.draw = function() {
		let position = this.getPosition();
		Renderer.drawLib.drawRect({
			position: position,
			diagonal: this.size,
			fillColor: this.selected ? '#557' : this.fillColor,
			strokeColor: this.selected ? '#33f' : '#444'
		});

		for (let input of this.inputs) input.draw();
		for (let output of this.outputs) output.draw();
			
		Renderer.drawLib.drawCenteredText({
			text: this.name + " id: " + this.id,
			position: this.getPosition().copy().add(this.size.copy().scale(.5)),
			fontSize: 15,
			color: '#fff'
		});

		if (this.getDepth() + 1 > Renderer.maxRenderDepth) return;
		for (let component of this.content) component.draw();
	}

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


	this.addComponent = function(_component, _forcedActivation = false) {
		_component.parent = this;
		this.content.push(_component);
		_component.activate(_forcedActivation);
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

	this.getNodeById = function(_id) {
		for (let input of this.inputs)
		{
			if (input.id == _id) return input;
		}
		for (let output of this.outputs)
		{
			if (output.id == _id) return output;
		}

		for (let component of this.content)
		{
			if (component.type == 'line') continue;
			let node = component.getNodeById(_id);
			if (!node) continue;
			return node;
		}
		return false;

	}

	this.remove = function(_removeDepth = 0) {
		for (let i = this.content.length - 1; i >= 0; i--) this.content[i].remove(_removeDepth + 1);
		HitBoxManager.unregister(this.hitBoxId);
		Builder.unregister(this.id);

		for (let i = this.inputs.length - 1; i >= 0; i--) this.inputs[i].remove(_removeDepth);
		for (let i = this.outputs.length - 1; i >= 0; i--) this.outputs[i].remove(_removeDepth);

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
	BaseComponent.call(this, {});
	this.type = 'line';
	
	this.from = from;
	this.to = to;

	let activated = false
	this.activate = function(_forcedActivation) {
		if (activated && !_forcedActivation) return console.warn('Already activated', this);
		activated = true;
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







function Node({turnedOn, name}, _parent, _id) {
	this.isNode = true;
	this.getDepth = function() {
		return this.parent.getDepth() + 1 - !!this.isInOutPut;
	}

	CircularHitBoxComponent.call(this, {radius: nodeRadius});
	ClickComponent.call(this);
	this.onclick = function() {};

	this.position = new Vector(0, 0);
	this.getPosition = function() {
		return this.parent.getPosition().copy().add(this.position);
	}
	this.activate = function() {};

	this.id 		= _id ? _id : 'node' + newId();// Symbol();
	this.turnedOn 	= turnedOn;
	this.toLines 	= [];
	this.fromLines 	= [];
	this.parent 	= _parent;
	this.name		= name;

	this.prevState  = false;
	this.run = async function(_index, _curRunID, _fullRun = false) {
		if (Runner.activated) return;
		// if (this.lastRunId == _curRunID) return Runner.addLoopedNode(this);
		this.lastRunId = _curRunID;

		this.prevState = this.turnedOn;
		this.turnedOn = false;
		for (let line of this.toLines)
		{
			if (!line.from.turnedOn) continue;
			this.turnedOn = true;
			break;
		}
		// console.log('run node', this.id, _index, 'update: ', !(prevStatus == this.turnedOn && !_fullRun));
		if (this.prevState == this.turnedOn && !_fullRun) return;

		// await Runner.awaitNextStep();
		for (let line of this.fromLines) line.to.run(_index + 1, _curRunID, _fullRun);
	}


	this.remove = function(_removeDepth = 0) {
		HitBoxManager.unregister(this.hitBoxId);
		for (let i = this.fromLines.length - 1; i >= 0; i--) this.fromLines[i].remove(_removeDepth);
		for (let i = this.toLines.length - 1; i >= 0; i--) this.toLines[i].remove(_removeDepth);

		let list = (this.isInput ? this.parent.inputs : this.parent.outputs);
		for (let i = 0; i < list.length; i++)
		{
			if (list[i].id != this.id) continue;
			list.splice(i, 1);
			break;
		}
		for (let i = 0; i < list.length; i++) list[i].index = i;
			
		for (let i = 0; i < this.parent.content.length; i++)
		{
			if (this.parent.content[i].id != this.id) continue;
			this.parent.content.splice(i, 1);
			break;
		}
	}

	this.export = function() {
		let item = {
			name: this.name,
		}
		return item;
	}

	this.draw = function() {
		if (this.getDepth() > Renderer.maxRenderDepth) return;
		Renderer.drawInOutPut({
			...this,
			position: this.getPosition(),
		});
		Renderer.drawLib.drawCenteredText({
			text: this.id.substr(4, 100),
			position: this.getPosition(),
			fontSize: 10,
			color: '#0ff'
		});
	}
}



function InOutput({name, turnedOn}, _parent, _index, _isInput = true) {
	Node.call(this, {turnedOn: turnedOn, name: name}, _parent);
	this.index = _index;
	this.isInput = _isInput;
	this.isInOutPut = true;

	this.getPosition = function() {
		let items = this.isInput ? this.parent.inputs : this.parent.outputs;
		let y = this.parent.size.value[1] / 2 - (items.length / 2 - this.index - .5) * (nodeRadius * 2 + inOutPutMargin * 2);
		return this.parent.getPosition().copy().add(new Vector(this.parent.size.value[0] * !this.isInput, y));
	}
}











function WorldInput({name, turnedOn}, _parent, _index) {
	let This = this;
	InOutput.call(this, {name, turnedOn}, _parent, _index, true);
	this.isWorldInput = true;
	this.setStatus = function(_status) {
		this.turnedOn = _status;
	}

	this.run = function(_curRunID, _fullRun = false) {
		for (let line of this.fromLines) line.to.run(1, _curRunID, _fullRun);
	}

	let drawNode = this.draw;
	this.draw = function() {
		drawNode.call(this);
		this.toggleButton.draw();
	}
	let enableHitBox = this.enableHitBox;
	this.enableHitBox = function() {
		enableHitBox.call(this);
		this.toggleButton.enableHitBox();
	}

	let remove = this.remove;
	this.remove = function() {
		remove.call(this);
		HitBoxManager.unregister(this.toggleButton.hitBoxId);
	}

	this.toggleButton = new function() {
		const width = 45;
		const height = 20;
		this.getDepth = function() {return 0;}

		HitBoxComponent.call(this, {hitBox: new Vector(width, height)});
		ClickComponent.call(this);

		this.onclick = function() {
			This.setStatus(!This.turnedOn);
			
			Runner.run();
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
			Renderer.drawLib.drawCenteredText({
				text: 'Toggle',
				position: position.copy().add(new Vector(width / 2, height / 2)),
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
	this.isWorldComponent = true;
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
	this.fillColor = 'rgba(0, 0, 0, 0)';


	let draw = this.draw;
	const actualThickness = 100;
	const visualThickness = 5;
	this.draw = function() {
		this.verticalSizeChanger.size = new Vector(World.size.value[0] + visualThickness, actualThickness);
		this.horizontalSizeChanger.size = new Vector(actualThickness, World.size.value[1] + visualThickness);

		this.verticalSizeChanger.draw();
		this.horizontalSizeChanger.draw();
		draw.call(this);
		this.inputNodeEditorButton.draw();
		this.outputNodeEditorButton.draw();
	}

	this.inputNodeEditorButton = new CurComponent_NodeEditorButton({isInput: true, parent: this})
	this.outputNodeEditorButton = new CurComponent_NodeEditorButton({isInput: false, parent: this})
	this.verticalSizeChanger = new CurComponent_VerticalSizeChanger(this, actualThickness, visualThickness);
	this.horizontalSizeChanger = new CurComponent_HorizontalSizeChanger(this, actualThickness, visualThickness);


	this.activate();
	this.verticalSizeChanger.enableHitBox();
	this.horizontalSizeChanger.enableHitBox();
	this.inputNodeEditorButton.enableHitBox();
	this.outputNodeEditorButton.enableHitBox();
}


function CurComponent_NodeEditorButton({isInput = true, parent}) {
	this.parent = parent;
	this.isInput = isInput;

	this.getDepth = function() {return 0;}

	const radius = nodeRadius;

	CircularHitBoxComponent.call(this, {radius: radius});
	ClickComponent.call(this);

	this.onclick = function() {
		Popup.nodeManager.open(this.isInput);
	}

	const heightPerNode = nodeRadius * 2 + inOutPutMargin * 2;
	this.getPosition = function() {
		let items = this.isInput ? this.parent.inputs : this.parent.outputs;

		let y = this.parent.size.value[1] / 2 - (items.length / 2 - items.length + 1 - .5) * heightPerNode;
		return this.parent.getPosition().copy().add(new Vector(this.parent.size.value[0] * !this.isInput, y + heightPerNode));
	}

	this.draw = function() {
		let position = this.getPosition();
		Renderer.drawLib.ctx.lineWidth = 3;
		Renderer.drawLib.drawCircle({
			position: position,
			radius: radius,
			fillColor: '#474',
			strokeColor: '#030'
		});
		Renderer.drawLib.ctx.lineWidth = 1;

		Renderer.drawLib.drawCenteredText({
			text: '+',
			position: position,
			color: '#0f0',
			fontSize: 20
		});
	}
}



function CurComponent_VerticalSizeChanger(_worldComponent, actualThickness, visualThickness) {
	let This = _worldComponent;
	
	this.size = new Vector(World.size.value[0], actualThickness);
	this.getDepth = function() {return 0;}
	this.getPosition = function() {
		return new Vector(0, This.getPosition().value[1] + This.size.value[1]);
	}
	HitBoxComponent.call(this, {hitBox: this.size});
	DragComponent.call(this);

	this.draw = function() {
		Renderer.drawLib.drawRect({
			position: new Vector(0, this.getPosition().value[1]),
			diagonal: new Vector(this.size.value[0], visualThickness),
			fillColor: '#555'
		})
	};


	this.drag = function(_delta) {
		This.size.add(_delta.copy().scale(-1));
	}
	this.dragEnd = function() {
		This.size = World.grid.snapToGrid(This.size);
		World.size = This.size;
	}
}

function CurComponent_HorizontalSizeChanger(_worldComponent, actualThickness, visualThickness) {
	let This = _worldComponent;

	this.size = new Vector(actualThickness, World.size.value[1]);
	this.getDepth = function() {return 0;}
	this.getPosition = function() {
		return new Vector(This.getPosition().value[0] + This.size.value[0], 0);
	}
	HitBoxComponent.call(this, {hitBox: this.size});
	DragComponent.call(this);

	this.draw = function() {
		Renderer.drawLib.drawRect({
			position: new Vector(this.getPosition().value[0], 0),
			diagonal: new Vector(visualThickness, this.size.value[1]),
			fillColor: '#555'
		})
	};

	this.drag = function(_delta) {
		This.size.add(_delta.copy().scale(-1));
	}
	this.dragEnd = function() {
		This.size = World.grid.snapToGrid(This.size);
		World.size = This.size;
	}
}


























function BuildComponent() {
	HitBoxComponent.call(this, {hitBox: this.size});
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
	this.draggable = true;
	this.drag = function(_delta) {
		this.position.add(_delta.copy().scale(-1));
	}
	this.dragEnd = function() {
		this.position = World.grid.snapToGrid(this.position);
	}
	Builder.register(this);
}

function HitBoxComponent({hitBox}) {
	let HitBox = hitBox.copy();
	this.area = HitBox.value[0] * HitBox.value[1];
	this.hitBoxId = Symbol();

	this.isPointInside = function(_position) {
		let delta = this.getPosition().difference(_position);
		if (delta.value[0] > HitBox.value[0] || delta.value[0] < 0) return false;
		if (delta.value[1] > HitBox.value[1] || delta.value[1] < 0) return false;

		return true;
	}

	let enabled = false;
	this.enableHitBox = function() {
		if (enabled) return;
		enabled = true;
		HitBoxManager.register(this);
	}
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

