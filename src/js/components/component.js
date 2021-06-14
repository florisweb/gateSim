


function BaseComponent({name, id, inputs, outputs, contents}) {
	this.type 		= 'BaseComponent';
	this.name 		= name;
	this.id 		= id ? id : newId();

	this.inputs 	= inputs;
	this.outputs 	= outputs;
	this.contents 	= contents;
}


function LineComponent({id}) {
	BaseComponent.call(this, {
		id: id,
		name: 'line',
		inputs: [{name: 'in'}],
		outputs: [{name: 'out'}],
		contents: [],
	});

	this.type = 'line';
} 





function CurComponent() {
	BaseComponent.call(this, arguments);
}


function WorldComponent({position}) {
	BaseComponent.call(this, arguments);
	this.position = position;
}