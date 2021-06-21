

function _Server() {
	const nandGate = JSON.parse("{\"position\":[0,0],\"name\":\"Nand gate\",\"id\":4461559745884998,\"componentId\":\"nandgate\",\"inputs\":[{\"name\":\"input 1\"},{\"name\":\"input 2\"}],\"outputs\":[{\"name\":\"output\"}],\"content\":[]}");
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

		// if (localStorage.components) this.components = this.components.concat(JSON.parse(localStorage.components));

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