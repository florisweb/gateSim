

function _ComponentManager() {
	this.components = [
		(new NandGateComponent({position: new Vector(0, 0)})).export(),
	];

	if (localStorage.components) this.components = this.components.concat(JSON.parse(localStorage.components));

	this.addComponent = function(_component) {
		this.components.push(_component);
		SideBar.componentList.setComponentList(this.components);
		localStorage.components = JSON.stringify(Object.assign([], this.components).splice(2, Infinity));
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
			position: 			new Vector(..._data.position),
			inputs:  			_data.inputs,
			outputs:  			_data.outputs
		});

		let lines = [];
		for (let componentData of _data.content)
		{
			if (componentData.type == 'line')
			{
				lines.push(componentData);
				continue;
			}

			component.addComponent(this.importComponent(componentData, false, false));
		}


		for (let lineData of lines)
		{
			let line = this.importLine(lineData, component);
			component.addComponent(line);
		}

		if (_isRoot) return setNewIds(component);
		return component;
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
		if (!targetComponent) return console.warn('component not found', _data, _component.content);

		let arr = _data.isInput ? targetComponent.inputs : targetComponent.outputs;
		if (_data.index > arr.length - 1) return console.warn('component-node not found', _data);;
		return arr[_data.index];
	}
}