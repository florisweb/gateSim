


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
	DrawComponent.call(this, ...arguments);
}




function DrawComponent({position = new Vector(0, 0)}) {
	BaseComponent.call(this, ...arguments);
	this.position = position;

	this.draw = function() {
		


	}

}