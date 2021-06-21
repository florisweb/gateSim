

function _ComponentManager() {

	this.addComponent = async function(_component) {
		let result = await Server.updateComponent(_component);
		if (!result) return;
		await SideBar.componentList.updateComponentList();
	}


	this.importComponent = function(_data, _isWorldComponent = false, _isRoot = true) {
		let componentConstructor = Component;
		switch (_data.componentId)
		{
			case 'nandgate': 		componentConstructor = NandGateComponent; break;
			case 'worldComponent': 	componentConstructor = CurComponent; break;
		}
		if (_isWorldComponent) componentConstructor = CurComponent;


		let component = new componentConstructor({
			id: 				_data.id,
			name: 				_data.name,
			componentId: 		_data.componentId,
			position: 			_data.position ? new Vector(..._data.position) : new Vector(0, 0),
			inputs:  			_data.inputs,
			outputs:  			_data.outputs
		});

		let lines = [];
		for (let componentReference of _data.content)
		{
			if (componentReference.type == 'line')
			{
				lines.push(componentReference);
				continue;
			}
			let newComponent = this.componentReferenceToComponent(componentReference, false, false);
			component.addComponent(newComponent);
		}


		// position: 		this.position.value, 
		// 	name: 			this.name, 
		// 	id: 			this.id, 
		// 	componentId: 	this.componentId, 
		// 	inputs: 		this.inputs.map(input => input.export()), 
		// 	outputs: 		this.outputs.map(output => output.export()), 
		// 	content: 		this.content.map(item => item.export()), 

		for (let lineData of lines)
		{
			let line = this.importLine(lineData, component);
			component.addComponent(line);
		}

		if (_isRoot) return setNewIds(component);
		return component;
	}

	
	this.componentReferenceToComponent = function(_reference, _isWorldComponent, _isRoot) {
		let componentData = Server.getComponentById(_reference.componentId);
		if (!componentData) return console.warn('Component not loaded:', _reference.componentId);
		let comp = this.importComponent(componentData, _isWorldComponent, _isRoot);
		comp.position 	= new Vector(..._reference.position);
		comp.id 		= _reference.id;
		return comp;
	}






	function setNewIds(_masterComponent) {
		_masterComponent.id = newId();
		for (let component of _masterComponent.content)
		{
			if (component.type == 'line') continue;
			setNewIds(component);
		}
		return _masterComponent;
	}


	this.importLine = function(_data, _component) {
		return new LineComponent({
			from: getNodeByData(_data.from, _component),
			to: getNodeByData(_data.to, _component),
		});
	}


	function getNodeByData(_data, _component) {
		let targetComponent = _component.getComponentById(_data.parentId);
		if (!targetComponent) return console.warn('Component not found', _data, _component.content);

		let arr = _data.isInput ? targetComponent.inputs : targetComponent.outputs;
		if (_data.index > arr.length - 1) return console.warn('Component-node not found', _data);;
		return arr[_data.index];
	}







	this.flattenComponent = function(_component, _masterParent = false) {
		let isRoot = !_masterParent;
		if (isRoot) _masterParent = _component;

		// Deal with nandgates
		if (_component.componentId == 'nandgate')
		{
			if (isRoot) return _component;
			_component.position = _component.getPosition();
			_component.parent = _masterParent;
			return [_component];
		}

		let content = [];
		// Transfer the in- and outputs to nodes
		if (!isRoot)
		{
			for (let input of _component.inputs)
			{
				let node = new Node(
					{
						turnedOn: input.turnedOn, 
						name: input.name
					}, 
					_masterParent,
					input.id,
				);
				node.position = input.getPosition();
				content.push(node);
			}

			for (let output of _component.outputs)
			{
				let node = new Node(
					{
						turnedOn: output.turnedOn, 
						name: output.name
					}, 
					_masterParent,
					output.id,
				);
				node.position = output.getPosition();
				content.push(node);
			}
		} else {
			for (let input of _component.inputs) input.fromLines = [];
			for (let output of _component.outputs) output.toLines = [];
		}
		
		
		// Recursively flatten all components
		for (let item of _component.content)
		{
			if (item.type == 'line') continue;
			let newContent = this.flattenComponent(item, _masterParent);
			content = content.concat(newContent);
		}

		// Readd the lines
		for (let line of _component.content)
		{
			if (line.type != 'line') continue;
			line.parent = _masterParent;
			line.from = getNodeFromContentById(content, line.from.id, _masterParent);
			line.to = getNodeFromContentById(content, line.to.id, _masterParent);
			if (!line.to || !line.from)
			{
				console.warn('[!] FlattenComponent.line: from/to node not found', line.from, line.to, line);
				continue;
			}
			content.push(line);
		}


		// Finish the process
		if (isRoot)
		{
			// for (let i = _component.content.length - 1; i >= 0; i--)
			// {
			// 	if (_component.content[i].type == 'line') 
			// 	{
			// 		_component.content[i].lineNeedsUpdate = true;
			// 		continue;
			// 	}
			// 	_component.content.splice(i, 1);
			// }
			_component.content = [];

			for (let item of content) _component.addComponent(item);

			// for (let i = 0; i < _component.content.length; i++)
			// {
			// 	if (_component.content[i].type != 'line' || !_component.content[i].lineNeedsUpdate) continue;
			// 	_component.content[i].from = getNodeFromContentById(content, _component.content[i].from.id, _component);
			// 	_component.content[i].to = getNodeFromContentById(content, _component.content[i].to.id, _component);
			// 	if (!_component.content[i].to || !_component.content[i].from) console.warn('[!] FlattenComponent.line: from/to node not found', _component.content[i]);
			// }

			return _component;
		}

		return content;
	}

	function getNodeFromContentById(_content, _id, _masterParent = {inputs: [], outputs: []}) {
		let nodes = [..._content, ..._masterParent.inputs, ..._masterParent.outputs];
		for (let node of nodes)
		{
			if (!node.isNode && node.componentId == 'nandgate')
			{
				let inputNode = getNodeFromContentById(node.inputs, _id);
				if (inputNode) return inputNode;	
				let outputNode = getNodeFromContentById(node.outputs, _id);
				if (outputNode) return outputNode;
			}

			if (!node.isNode || node.id != _id) continue;
			return node;
		}
		return false;
	}

	function getLineById(_content, _id) {
		for (let line of _content)
		{
			if (line.type != 'line' || line.id != _id) continue;
			return line;
		}
		return false;
	}



	this.optimizeComponent = function(_component) {
		// let component = this.flattenComponent(Object.assign({}, _component))
		let component = Object.assign({}, _component);
		let originalComponentLength = component.content.length;
		for (let i = originalComponentLength - 1; i >= 0; i--)
		{
			let node = component.content[i];
			if (!node.isNode) continue;

			if (node.toLines.length == 1)
			{
				for (let fromLine of node.fromLines)
				{
					let line = new LineComponent({
						from: node.toLines[0].from,
						to: fromLine.to
					});
					component.addComponent(line);
					line.activate();
				}

				node.remove();
				continue;
			}

			if (node.fromLines.length == 1)
			{
				for (let toLine of node.toLines)
				{
					let line = new LineComponent({
						from: toLine.from,
						to: node.fromLines[0].to
					});
					component.addComponent(line);
					line.activate();
				}
				node.remove();
				continue;
			}
		}

		return component;
	}


	function addLine(_config = {from, to}, _component) {
		let line = new LineComponent(_config);
		line.parent = _component;
		line.activate();
		return line;
	}
}