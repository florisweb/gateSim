

function _Server() {
	const nandGate = JSON.parse("{\"position\":[0,0],\"name\":\"Nand gate\",\"id\":3547287069148126,\"componentId\":" + NandGateComponentId + ",\"inputs\":[{\"name\":\"\"},{\"name\":\"\"}],\"outputs\":[{\"name\":\"\"}],\"content\":[]}");
	this.components = [nandGate];

	this.getComponentById = function(_compId) {
		for (let component of this.components)
		{
			if (component.componentId != _compId) continue;
			return component;
		}
		return false;
	}


	this.getComponentList = async function() {
		let response = await REQUEST.send('database/interface/getComponentList.php');

		if (response.error) return console.error('Server:', response);

		this.components = [
			nandGate,
			...response.result
		];

		return this.components;
	}

	this.removeComponent = async function(_id) {
		let response = await REQUEST.send('database/interface/removeComponent.php', "id=" + _id);
		if (response.error) return response.error;
		await this.getComponentList();
		return response.result;
	}


	this.updateComponent = async function(_component) {
		let component = _component;
		let response = await REQUEST.send('database/interface/updateComponent.php', "component=" + JSON.stringify(component));
		if (response.error) return response.error;
		await this.getComponentList();
		return response.result;
	}
}