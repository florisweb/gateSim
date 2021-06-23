

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
			case NandGateComponentId: 	componentConstructor = NandGateComponent; break;
			case 'worldComponent': 		componentConstructor = CurComponent; break;
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
		if (_component.componentId == NandGateComponentId)
		{
			if (isRoot) return _component;
			_component.position = _component.getPosition();
			_component.parent = _masterParent;
			let nodes = [..._component.inputs, ..._component.outputs];
			for (let node of nodes) 
			{
				node.fromLines = [];
				node.toLines = [];
			}

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
			// 	_component.content[i].remove();
			// }
			// console.log(_component.content);
			_component.content = [];

			for (let item of content) _component.addComponent(item, true);

			return _component;
		}

		return content;
	}

	function getNodeFromContentById(_content, _id, _masterParent = {inputs: [], outputs: []}) {
		let nodes = [..._content, ..._masterParent.inputs, ..._masterParent.outputs];
		for (let node of nodes)
		{
			if (!node.isNode && node.componentId == NandGateComponentId)
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
		return new Promise(async function (resolve) {


		// let component = this.flattenComponent(Object.assign({}, _component))
		let component = Object.assign({}, _component);
		let originalComponentLength = component.content.length;
		let newLines = [];
		let nodesToBeRemoved = [];
		let lockedNode = false;


		for (let i = originalComponentLength - 1; i >= 0; i--)
		{
			let node = component.content[i];
			if (!node.isNode) 
			{
				if (node.type != 'line') continue;
				let line = new LineComponent({
					from: node.from,
					to: node.to
				});
				newLines.push(line);

				continue;
			};

			if (node.toBeRemoved) continue;
			if (node.locked) 
			{
				console.warn('Node is locked', i);
				continue;
			}

			if (node.toLines.length == 1)
			{
				for (let fromLine of node.fromLines)
				{
					console.log('lock', lockNode(fromLine.to));
					let line = new LineComponent({
						from: node.toLines[0].from,
						to: fromLine.to
					});
					newLines.push(line);
				}

				// node.remove();
				node.toBeRemoved = true;
				nodesToBeRemoved.push(node);
				continue;
			}

			if (node.fromLines.length == 1)
			{
				for (let toLine of node.toLines)
				{
					console.log('lock', lockNode(toLine.from));
					let line = new LineComponent({
						from: toLine.from,
						to: node.fromLines[0].to
					});
					newLines.push(line);
				}
				// node.remove();
				node.toBeRemoved = true;
				nodesToBeRemoved.push(node);
				continue;
			}
		}


		for (let i = component.content.length - 1; i >= 0; i--)
		{
			if (component.content[i].type != 'line') continue;
			component.content[i].remove();
		}

		setTimeout(function () {
			console.log('remove', nodesToBeRemoved);
			for (let i = nodesToBeRemoved.length - 1; i >= 0; i--)
			{
				nodesToBeRemoved[i].remove();
			}
		}, 10);

		for (let line of newLines) 
		{
			component.addComponent(line);
		}

		function lockNode(_node) {
			for (let i = 0; i < component.content.length; i++)
			{
				if (!component.content[i].isNode) continue;
				if (component.content[i].id != _node.id) continue;
				component.content[i].locked = true;	
				lockedNode = true;
				return true;
			}
		}

		function lineIsFreeNodeLine(_line) {
			return !_line.to.isInOutPut && !_line.from.isInOutPut;
		}




		for (let node of component.content)
			{
				if (!node.isNode) continue;
				delete node.locked;
			}
			
		if (lockedNode) 
		{
			setTimeout(async function () {
				console.warn('there are still locked nodes, trying again...');
				resolve(await ComponentManager.optimizeComponent(component));
			}, 20);
		}

			resolve(component);
		});
	}
}