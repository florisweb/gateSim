

function _Runner() {
	let This = this;
	this.activated = false;
	this.runSpeed = 100;
	this.autoRun = false;
	this.instantMode = false;

	let resolver;
	let curPromise;
	this.nextStep = function() {
		resolver();
	}
	this.awaitNextStep = async function() {
		if (Runner.instantMode) return;
		if (curPromise) await curPromise;
		curPromise = new Promise((resolve) => {
			resolver = resolve;
			if (!Runner.autoRun) return;
			setTimeout(() => {
				resolve();
			}, Runner.runSpeed)
		})
		return curPromise;
	}



	this.loopCue = [];
	this.addLoopedNode = function(_node) {
		if (this.loopCue.find((node) => _node.id == _node.id)) return;
		this.loopCue.push(_node);
	}

	this.curRunId;
	let internalCurRunId;
	this.run = async function(_fullRun = false) {
		this.loopCue = [];
		let runId = newId();
		console.warn('run', runId);
		this.curRunId = runId;
		internalCurRunId = runId;

		for (let input of World.curComponent.inputs)
	    {
	    	input.run(runId, _fullRun);
	    }
	    
	    let subLoop = 0;
	    while (this.loopCue.length > 0 && internalCurRunId == runId)
	    {
	    	subLoop++;
	    	await wait(this.runSpeed);
	    	this.runLoopCue(subLoop, false); // Never run as _fullRun, because it will get stuck in a loop this way
	    }
	}
	this.runLoopCue = function(_subLoop, _fullRun) {
		this.curRunId = newId();
		let newCue = Object.assign([], this.loopCue);
		this.loopCue = [];
		console.log('run loopCue', _subLoop, newCue);
		for (let node of newCue)
	    {
	    	node.run(0, this.curRunId, _fullRun);
	    }
	}



	async function wait(_length) {
		return new Promise(function (resolve) {setTimeout(resolve, _length)});
	}



	this.createFormulas = function(_component = World.curComponent) {
		let out = [];
		for (let output of _component.outputs)
		{
			out.push(this.createFormulaForOutput(output));
		}
		return out;
	}

	this.createFormulaForOutput = function(_output) {
		let out = "";
		for (let lineTo of _output.toLines)
		{
			let parent = lineTo.from.parent;
			if (parent.isWorldComponent) 
			{
				out += "IN" + lineTo.from.index + " || ";	
				continue;
			}

			if (out) out += " || ";
			if (parent.componentId == NandGateComponentId)
			{
				out += "nand(" + this.createFormulaForOutput(parent.inputs[0]) + ", " + this.createFormulaForOutput(parent.inputs[1]) + ")";
				continue;
			}

			out += this.createFormulaForOutput(lineTo.from);
		}
		return out.split(" || ").filter((a) => a).join(" || ");
	}


	this.calcComponentOutput = function(_component, _inputs) {
		let formulas = this.createFormulas(_component);
		let outputs = []
		for (let formula of formulas)
		{
			let curFormula = formula;
			for (let i = 0; i < _inputs.length; i++)
			{
				curFormula = curFormula.split("IN" + i).join(_inputs[i]);
			}

			outputs.push(eval(curFormula));
		}

		return outputs;

		function nand(a, b) {return !(a && b)};
	}

}





// function _Runner() {
// 	let This = this;
// 	this.runTree = new RunTree();
// 	this.activated = false;

// 	const maxLayerCount = 300;
// 	const maxNodeUpdates = 100;


// 	this.createRunTree = async function(_component) {
// 		console.warn('Runner: Creating runtree.');
// 		this.runTree = new RunTree();
		
// 		createRunTreeLayer(_component.inputs, 0);
// 		for (let i = 1; i < maxLayerCount; i++)
// 		{
// 			let curLayer = this.runTree[i - 1]
// 			if (!curLayer.length) break;
// 			createRunTreeLayer(curLayer, i);
// 			await wait(0); // Wait after every layer to give the CPU some breathing time
// 		}

// 		resetNodes();
// 		console.warn('Runner: Finished creating runTree (' + this.runTree.length + ' layers)');
// 	}

// 	this.reEvaluate = async function() {
// 		await this.createRunTree(World.curComponent);
// 		await this.runTree.run();
// 	}


// 	async function createRunTreeLayer(_prevLayerNodes, _depth = 0) {
// 		if (!This.runTree[_depth]) This.runTree.addLayer(_depth);
// 		for (let node of _prevLayerNodes)
// 		{			
// 			let outputNode = node;
// 			if (node.parent.componentId == NandGateComponentId) outputNode = node.parent.outputs[0]

// 			for (let line of outputNode.fromLines) 
// 			{
// 				if (line.to.updateCount == undefined) line.to.updateCount = 0;
// 				line.to.updateCount++;
// 				if (line.to.updateCount > maxNodeUpdates) continue;
// 				This.runTree[_depth].addNode(line.to);
// 			}
// 		}
// 	}

// 	function resetNodes() {
// 		for (let layer of Runner.runTree)
// 		{
// 			for (let node of layer) 
// 			{
// 				delete node.updateCount;
// 			}
// 		}
// 	}


// 	function RunTree() {
// 		let arr = [];
// 		arr.addLayer = function(_index) {
// 			let subArr = [];
// 			subArr.addNode = function(_node) {
// 				for (let i = 0; i < this.length; i++)
// 				{
// 					if (_node.id == this[i].id) return;
// 				}
// 				this.push(_node);
// 			}

// 			subArr.run = function() {
// 				for (let i = 0; i < subArr.length; i++) subArr[i].run2();
// 			}

// 			arr[_index] = subArr;
// 		}

// 		arr.visualize = function() {
// 			console.info('=== Visualizing ===');
// 			for (let i = 0; i < this.length; i++)
// 			{
// 				console.info("[" + i + "]: ", this[i].map(r => r.id));
// 			}
// 		}
// 		arr.createNodeList = function() {
// 			let curArr = [];
// 			for (let layer of this) curArr = curArr.concat(layer.map(r => r.id));
// 			return curArr;
// 		}

// 		arr.run = async function() {
// 			for (let r = 0; r < 5; r++) // TODO: Figure out why the system requires multiple runs: has something to do with the nand-gate not communicating it's value correctly
// 			{	
// 				for (let i = 0; i < this.length; i++) arr[i].run();
// 			}
// 		}
		

// 		return arr;
// 	}


// 	async function wait(_length) {
// 		return new Promise(function (resolve) {setTimeout(resolve, _length)});
// 	}
// }



