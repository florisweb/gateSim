let orGateData = JSON.parse("{\"position\":[0,0],\"name\":\"Or Gate\",\"id\":2163675280867424,\"componentId\":8669924151900503,\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true},{\"name\":\"input 2\",\"turnedOn\":true}],\"outputs\":[{\"name\":\"output 1\",\"turnedOn\":true}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":false}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2163675280867424,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":2163675280867424,\"index\":0,\"isInput\":false}}]}");
let andGateData = JSON.parse("{\"position\":[0,0],\"name\":\"And Gate\",\"id\":1716337678792325,\"componentId\":4353403633738826,\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":false},{\"name\":\"input 2\",\"turnedOn\":false}],\"outputs\":[{\"name\":\"output 1\",\"turnedOn\":false}],\"content\":[{\"position\":[265.03315290933693,271.52841677943167],\"name\":\"Nand gate\",\"id\":1295166692822345,\"componentId\":\"nandgate\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":false},{\"name\":\"input 2\",\"turnedOn\":false}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":true}],\"content\":[{\"position\":[0,20],\"name\":\"Inverter\",\"id\":3070228760152597,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":false}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":true}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3070228760152597,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":3070228760152597,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":1295166692822345,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":3070228760152597,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":1295166692822345,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":3070228760152597,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":3070228760152597,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":1295166692822345,\"index\":0,\"isInput\":false}}]},{\"position\":[482.62449255750994,263.95060893098776],\"name\":\"Nand gate\",\"id\":4887709692163252,\"componentId\":\"nandgate\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true},{\"name\":\"input 2\"}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":false}],\"content\":[{\"position\":[0,20],\"name\":\"Inverter\",\"id\":2693866143938544,\"componentId\":\"inverter\",\"inputs\":[{\"name\":\"input 1\",\"turnedOn\":true}],\"outputs\":[{\"name\":\"output\",\"turnedOn\":false}],\"content\":[{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2693866143938544,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":2693866143938544,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":4887709692163252,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":2693866143938544,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":4887709692163252,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":2693866143938544,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":2693866143938544,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":4887709692163252,\"index\":0,\"isInput\":false}}]},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":1716337678792325,\"index\":0,\"isInput\":true},\"to\":{\"parentId\":1295166692822345,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":1295166692822345,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":4887709692163252,\"index\":0,\"isInput\":true}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":4887709692163252,\"index\":0,\"isInput\":false},\"to\":{\"parentId\":1716337678792325,\"index\":0,\"isInput\":false}},{\"name\":\"line\",\"type\":\"line\",\"from\":{\"parentId\":1716337678792325,\"index\":1,\"isInput\":true},\"to\":{\"parentId\":1295166692822345,\"index\":1,\"isInput\":true}}]}");


function _ComponentManager() {

	this.importComponent = function(_data) {

		let componentConstructor = Component;
		switch (_data.componentId)
		{
			case 'nandgate': 		componentConstructor = NandGateComponent; break;
			case 'inverter': 		componentConstructor = InverterComponent; break;
			case 'worldComponent': 	componentConstructor = CurComponent; break;
		}


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

			component.addComponent(this.importComponent(componentData));
		}


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