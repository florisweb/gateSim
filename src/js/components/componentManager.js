let a = JSON.parse("{\"position\":[211.63734776725292,271.85385656292283],\"name\":\"Nand gate\",\"id\":\"test\",\"componentId\":\"nandgate\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true},{\"name\":\"input 2\",\"turnedOn\":true}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":false}],\"content\":[{\"position\":[0,20],\"name\":\"Inverter\",\"id\":5123668641656572,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":false}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5123668641656572,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":5123668641656572,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":\"test\",\"index\":0,\"isInput\":true},\"to\":{\"parentId\":5123668641656572,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":\"test\",\"index\":1,\"isInput\":true},\"to\":{\"parentId\":5123668641656572,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":5123668641656572,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":\"test\",\"index\":0,\"isInput\":false}}]}");

function _ComponentManager() {

	this.importComponent = function(_data) {

		let componentConstructor = Component;
		switch (_data.componentId)
		{
			case 'nandgate': 		componentConstructor = NandGateComponent; break;
			case 'inverter': 		componentConstructor = InverterComponent; break;
			case 'worldComponent': 	componentConstructor = CurComponent; break;
		}


		let content = [];
		let lines = [];
		for (let componentData of _data.content)
		{
			let component = false;
			if (componentData.type == 'line')
			{
				lines.push(componentData);
				continue;
			}

			content.push(this.importComponent(componentData));
		}

		let component = new componentConstructor({
			id: 				_data.id,
			name: 				_data.name,
			componentId: 		_data.componentId,
			position: 			new Vector(..._data.position),
			inputs:  			_data.inputs,
			outputs:  			_data.outputs,
			content: 			content
		});

		for (let lineData of lines)
		{
			let line = this.importLine(lineData, component);
			component.addComponent(line);
		}

		return component;
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