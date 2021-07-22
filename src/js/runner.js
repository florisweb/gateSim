

function _Runner() {
	let This = this;
	this.runTree = new RunTree();
	this.activated = true;

	const maxLayerCount = 300;
	const maxNodeUpdates = 10;


	this.createRunTree = async function(_component) {
		console.warn('Runner: Creating runtree.');
		this.runTree = new RunTree();
		
		createRunTreeLayer(_component.inputs, 0);
		for (let i = 1; i < maxLayerCount; i++)
		{
			let curLayer = this.runTree[i - 1]
			if (!curLayer.length) break;
			createRunTreeLayer(curLayer, i);
			await wait(0); // Wait after every layer to give the CPU some breathing time
		}

		resetNodes();
		console.warn('Runner: Finished creating runTree (' + this.runTree.length + ' layers)');
	}

	this.reEvaluate = async function() {
		await this.createRunTree(World.curComponent);
		await this.runTree.run();
	}


	async function createRunTreeLayer(_prevLayerNodes, _depth = 0) {
		if (!This.runTree[_depth]) This.runTree.addLayer(_depth);
		for (let node of _prevLayerNodes)
		{			
			let outputNode = node;
			if (node.parent.componentId == NandGateComponentId) outputNode = node.parent.outputs[0]

			for (let line of outputNode.fromLines) 
			{
				if (line.to.updateCount == undefined) line.to.updateCount = 0;
				line.to.updateCount++;
				if (line.to.updateCount > maxNodeUpdates) continue;
				This.runTree[_depth].addNode(line.to);
			}
		}
	}

	function resetNodes() {
		for (let layer of Runner.runTree)
		{
			for (let node of layer) 
			{
				delete node.updateCount;
			}
		}
	}


	function RunTree() {
		let arr = [];
		arr.addLayer = function(_index) {
			let subArr = [];
			subArr.addNode = function(_node) {
				for (let i = 0; i < this.length; i++)
				{
					if (_node.id == this[i].id) return;
				}
				this.push(_node);
			}

			subArr.run = function() {
				for (let i = 0; i < subArr.length; i++) subArr[i].run2();
			}

			arr[_index] = subArr;
		}

		arr.visualize = function() {
			console.info('=== Visualizing ===');
			for (let i = 0; i < this.length; i++)
			{
				console.info("[" + i + "]: ", this[i].map(r => r.id));
			}
		}
		arr.createNodeList = function() {
			let curArr = [];
			for (let layer of this) curArr = curArr.concat(layer.map(r => r.id));
			return curArr;
		}

		arr.run = async function() {
			for (let r = 0; r < 5; r++) // TODO: Figure out why the system requires multiple runs: has something to do with the nand-gate not communicating it's value correctly
			{	
				for (let i = 0; i < this.length; i++) arr[i].run();
			}
		}
		

		return arr;
	}


	async function wait(_length) {
		return new Promise(function (resolve) {setTimeout(resolve, _length)});
	}
}



