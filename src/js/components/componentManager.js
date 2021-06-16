

function _ComponentManager() {
	let nandGate = new NandGateComponent({position: new Vector(0, 0)});
	nandGate.addInverter();
	this.components = [
		JSON.parse("{\"position\":[0,0],\"name\":\"Or Gate\",\"id\":2163675280867424,\"componentId\":8669924151900503,\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true},{\"name\":\"input 2\",\"turnedOn\":true}],\"outputs\":[{\"name\":\"output 1\",\"turnedOn\":true}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":false}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2163675280867424,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":false}}]}"),
		JSON.parse("{\"position\":[0,0],\"name\":\"And Gate\",\"id\":3053905272404609,\"componentId\":7620753948389335,\"inputs\":[{\"name\":\"input 1\"},{\"name\":\"input 2\"}],\"outputs\":[{\"name\":\"output 1\"}],\"content\":[{\"position\":[110.18867924528305,252.83018867924528],\"name\":\"Inverter\",\"id\":5486295181917157,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\"}],\"outputs\":[{\"name\":\"output\"}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3053905272404609,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":true}},{\"position\":[106.41509433962267,299.6226415094339],\"name\":\"Inverter\",\"id\":5486295181917157,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\"}],\"outputs\":[{\"name\":\"output\"}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3053905272404609,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":true}},{\"position\":[365.2830188679242,263.3962264150943],\"name\":\"Nand gate\",\"id\":3455827883671711,\"componentId\":\"nandgate\",\"inputs\":[{\"name\":\"input 1\"},{\"name\":\"input 2\"}],\"outputs\":[{\"name\":\"output\"}],\"content\":[{\"position\":[160.7547169811321,170.18867924528303],\"name\":\"Inverter\",\"id\":6072984542857026,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\"}],\"outputs\":[{\"name\":\"output\"}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":6072984542857026,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":6072984542857026,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3455827883671711,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":6072984542857026,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3455827883671711,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":6072984542857026,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":6072984542857026,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":3455827883671711,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":3455827883671711,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5486295181917157,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":3455827883671711,\"index\":1,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3455827883671711,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":3053905272404609,\"index\":0,\"isInput\":false}}]}"),
		nandGate.export(),
		(new InverterComponent({position: new Vector(0, 0)})).export(),
	];

	this.addComponent = function(_component) {
		this.components.push(_component);
		SideBar.componentList.setComponentList(this.components)
	}

	this.importComponent = function(_data, _isWorldComponent = false, _isRoot = true) {

		let componentConstructor = Component;
		switch (_data.componentId)
		{
			case 'nandgate': 		componentConstructor = NandGateComponent; break;
			case 'inverter': 		componentConstructor = InverterComponent; break;
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