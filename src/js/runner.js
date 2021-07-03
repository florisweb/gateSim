

function _Runner() {
	let This = this;
	this.runTree = new RunTree();
	const batchSize = 20;
	const maxBatchCount = 1;

	this.createRunTree = async function(_component) {
		console.warn('Runner: Creating runtree.');
		this.runTree = new RunTree()
		let promises = [];

		for (let input of _component.inputs) 
		{
			for (let line of input.fromLines) 
			{
				promises.push(recursiveRunTreeGenerator(line.to, 0));
			}
		}

		await Promise.all(promises);
	}

	this.reEvaluate = async function() {
		await this.createRunTree(World.curComponent);
		await this.runTree.run();
	}


	async function recursiveRunTreeGenerator(_node, _depth = 0) {
		if (_depth > batchSize * maxBatchCount) return console.warn('runner.createRunTree: Maxdepth reached.', _depth, batchSize);
		if (_depth % batchSize == 0 && _depth != 0) await wait(0); // Adds a little spacer as to not crash the browser

		if (!This.runTree[_depth]) This.runTree.addLayer(_depth);
		This.runTree[_depth].addNode(_node);

		let promises = [];
		if (_node.parent.componentId == NandGateComponentId)
		{
			for (let line of _node.parent.outputs[0].fromLines) 
			{
				promises.push(recursiveRunTreeGenerator(line.to, _depth + 1));
			}
		} else {
			for (let line of _node.fromLines)
			{
				promises.push(recursiveRunTreeGenerator(line.to, _depth + 1));
			}
		}

		return await Promise.all(promises);
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
				for (let i = 0; i < subArr.length; i++) subArr[i].run();
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
				if (i % batchSize == 0 && i != 0) await wait(0);
				await arr[i].run();
			}
		}

		return arr;
	}


	async function wait(_length) {
		return new Promise(function (resolve) {setTimeout(resolve, _length)});
	}
}



