

function _Runner() {
	let This = this;
	this.runTree = new RunTree();
	this.activated = true;
	const nodesPerBatch = 100;
	const maxBatchCount = 100;
	let curNodeCount = 0;
	let curBatchIndex = 0;

	this.createRunTree = async function(_component) {
		console.warn('Runner: Creating runtree.');
		curNodeCount = 0;
		curBatchIndex = 0;
		this.runTree = new RunTree();
		
		let curIndex = 0;
		let totalStartNodes = 0;
		for (let input of _component.inputs) totalStartNodes += input.fromLines.length;
		for (let input of _component.inputs) 
		{
			for (let line of input.fromLines) 
			{
				curIndex++;
				console.info('Progress:', curIndex / totalStartNodes * 100 + "%");
				await recursiveRunTreeGenerator(line.to, 0);
			}
		}

		resetNodes();
		console.warn('Runner: Finished creating runTree');
	}

	this.reEvaluate = async function() {
		await this.createRunTree(World.curComponent);
		await this.runTree.run();
	}


	async function recursiveRunTreeGenerator(_node, _depth = 0) {
		if (_node.passed) return;
		_node.passed = true;
		if (curNodeCount > nodesPerBatch) 
		{
			curBatchIndex++;
			curNodeCount = 0;
			await wait(0); // Adds a little spacer as to not crash the browser
		}

		if (curBatchIndex > maxBatchCount) return console.warn('max batchcount reached', curBatchIndex, maxBatchCount);

		if (!This.runTree[_depth]) This.runTree.addLayer(_depth);
		This.runTree[_depth].addNode(_node);

		if (_node.parent.componentId == NandGateComponentId)
		{
			for (let line of _node.parent.outputs[0].fromLines) 
			{
				await recursiveRunTreeGenerator(line.to, _depth + 1);
			}
		} else {
			for (let line of _node.fromLines)
			{
				await recursiveRunTreeGenerator(line.to, _depth + 1);
			}
		}
	}

	function resetNodes() {
		for (let layer of Runner.runTree)
		{
			for (let node of layer) 
			{
				delete node.passed;
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
				curNodeCount++;
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

		arr.run = async function() {
			for (let i = 0; i < this.length; i++)
			{
				await arr[i].run();
			}
		}

		return arr;
	}


	async function wait(_length) {
		return new Promise(function (resolve) {setTimeout(resolve, _length)});
	}
}



