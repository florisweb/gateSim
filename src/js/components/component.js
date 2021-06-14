


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



function InOutput({name}, _parent, _index, _isInput = true) {
	this.index = _index;
	this.name = name;
	this.isInput = _isInput;
	let Parent = _parent;

	this.getPosition = function() {
		let items = this.isInput ? Parent.inputs : Parent.outputs;
		let y = Parent.size.value[1] / 2 - (items.length / 2 - this.index - .5) * (inOutPutRadius * 2 + inOutPutMargin * 2);
		return Parent.position.copy().add(new Vector(Parent.size.value[0] * !this.isInput, y));
	}
}





function LineComponent({id, from, to}) {
	BaseComponent.call(this, {
		id: id,
		name: 'line',
		inputs: [{name: 'in'}],
		outputs: [{name: 'out'}],
		content: [],
	});

	this.from = from;
	this.to = to;
	this.type = 'line';

	this.draw = function() {
		Renderer.drawLib.drawLine({
			startPosition: this.from.getPosition(),
			endPosition: this.to.getPosition(),
			color: '#f00'
		});
	}


} 





function CurComponent({inputs, outputs}) {
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

	this.fillColor = 'rgba(0, 0, 0, 0)';
}
