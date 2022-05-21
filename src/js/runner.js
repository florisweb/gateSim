

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





	let formulas = [];
	let internalVariables = [];
	this.prepareRun = function() {
		let formulaSet = this.createOptimizedFormulas(World.curComponent);
		formulas = formulaSet.formulas;
		internalVariables = formulaSet.variables;
		for (let variable of internalVariables) variable.state = false;
	}
	this.getInfo = () => [formulas, internalVariables];

	let nand = (a, b) => !(a && b);
	this.evaluateModel = function(_inputs) {
		// Evaluate the internal variables
		let pseudoVars = [];
		for (let variable of internalVariables)
		{
			let curFormula = variable.getFormulaSet(World.curComponent).formula;
			for (let i = 0; i < _inputs.length; i++)
			{
				curFormula = curFormula.split("IN" + i).join(_inputs[i] ? 1 : 0);
			}

			let parts = curFormula.split("LOOP(");

			let newFormula = parts[0];
			for (let p = 1; p < parts.length; p++)
			{
				let endIndex = parts[p].split("").findIndex((a) => a == ")");

				let varName = parts[p].substr(0, endIndex);
				let suffix = parts[p].substr(endIndex + 1, parts[p].length);
				
				let node = World.curComponent.getNodeById(varName);
				newFormula += node.turnedOn + suffix;


				if (pseudoVars.find((_var) => _var.nodeName == varName)) continue;
				pseudoVars.push(new Variable({nodeName: varName, component: World.curComponent}));
			}

			
			variable.getNode().turnedOn = eval(newFormula);
			console.log("var: execute formula", newFormula, variable, "value:", variable.getNode().turnedOn);
		}

		for (let pseudo of pseudoVars)
		{
			pseudo.getNode().turnedOn = evaluateFormula(pseudo.getFormulaSet(World.curComponent).formula, _inputs);
			console.log('pseudo', pseudo, pseudo.getNode().turnedOn);
		}


		// Evalute the actual system
		return formulas.map((_formula) => evaluateFormula(_formula, _inputs));
	}

	function evaluateFormula(_formula, _inputs) {
		let curFormula = _formula;
		for (let i = 0; i < _inputs.length; i++)
		{
			curFormula = curFormula.split("IN" + i).join(_inputs[i] ? 1 : 0);
		}

		for (let variable of internalVariables)
		{
			let state = variable.getNodeState();
			curFormula = curFormula.split("LOOP(" + variable.nodeName + ")").join(state ? 1 : 0);
		}

		console.log("execute formula", curFormula);
			
		return eval(curFormula);
	}





	this.createFormulas = function(_component = World.curComponent) {
		let out = [];
		let variables = [];
		for (let output of _component.outputs)
		{
			let uniqueId = newId();
			let result = this.createFormulaForOutput(output, uniqueId);
			variables = variables.concat(result.variables);
			out.push(result.formula);
		}
		return {
			formulas: out,
			variables: variables
		}
	}
	this.createOptimizedFormulas = function(_component = World.curComponent) {
		let result = this.createFormulas(...arguments);
		let optimizedVariables = [];
		for (let variable of result.variables)
		{
			let formulaSet = variable.getFormulaSet(_component); 

			let isSubstitutable = true;
			for (let subVar of formulaSet.variables)
			{
				if (!optimizedVariables.find((_var) => _var.nodeName == subVar.nodeName)) continue;
				isSubstitutable = false;
				break;
			}

			optimizedVariables.push(variable);
			if (!isSubstitutable) continue;
			variable.formula = formulaSet.formula;
		}
		result.variables = optimizedVariables;
		let baseVariables = [];

		for (let i = 0; i < result.formulas.length; i++)
		{
			for (let variable of optimizedVariables)
			{
				if (!variable.formula) 
				{
					baseVariables.push(variable);
					continue;
				};
				let parts = result.formulas[i].split("LOOP(" + variable.nodeName + ")");
				result.formulas[i] = parts.join("(" + variable.formula + ")")
			}
		}
		result.variables = baseVariables;
		return result;
	}

	this.createFormulaForOutput = function(_output, _uniqueId, _originalOutput) {
		if (!_originalOutput) _originalOutput = _output;
		let variables = [];
		let out = "";
		for (let lineTo of _output.toLines)
		{
			let parent = lineTo.from.parent;
			if (lineTo.from.formulaId == _uniqueId && nodeDependantOn(lineTo.from, _output) && lineTo.from.id != _originalOutput.id) // a node can't be dependant on itself
			{
				out = "LOOP(" + lineTo.from.id + ") || ";

				let variable = new Variable({nodeName: lineTo.from.id, component: lineTo.parent}, variables.length);
				variables.push(variable);
				continue;
			}

			lineTo.from.formulaId = _uniqueId;

			if (parent.isWorldComponent) 
			{
				out += "IN" + lineTo.from.index + " || ";	
				continue;
			}

			if (out) out += " || ";
			if (parent.componentId == NandGateComponentId)
			{
				let resultA = this.createFormulaForOutput(parent.inputs[0], _uniqueId, _originalOutput);
				let resultB = this.createFormulaForOutput(parent.inputs[1], _uniqueId, _originalOutput);
				variables = variables.concat(resultA.variables).concat(resultB.variables);
				out += "nand(" + resultA.formula + ", " + resultB.formula + ")";
				continue;
			}

			
			let result = this.createFormulaForOutput(lineTo.from, _uniqueId, _originalOutput);
			variables = variables.concat(result.variables);
			out += result.formula;
		}


		let actualVariables = [];
		for (let variable of variables)
		{
			let exists = actualVariables.find((_var) => _var.nodeName == variable.nodeName);
			if (exists)
			{
				exists.merge(variable);
				continue;
			}
			actualVariables.push(variable);
		}


		return {
			formula: out.split(" || ").filter((a) => a).join(" || "),
			variables: actualVariables,
		}
	}


	function nodeDependantOn(_node, _dependantOnNode, _depth = 0) {
		if (_node.parent.isWorldComponent) return false;
		if (_depth > 5) return true;
		for (let line of _node.toLines)
		{
			if (line.from.id == _dependantOnNode.id) return true;
			if (nodeDependantOn(line.from, _dependantOnNode, _depth + 1)) return true;
		}
		return false;
	}

	this.calcComponentOutput = function(_component = World.curComponent, _inputs) {
		let formulas = this.createFormulas(_component);
		let outputs = [];
		let unknownVariables = [];
		let trulyUnknownVariables = [];

		for (let formula of formulas)
		{
			let curFormula = formula;
			for (let i = 0; i < _inputs.length; i++)
			{
				curFormula = curFormula.split("IN" + i).join(_inputs[i]);
			}

			let variableParts = curFormula.split("LOOP(");
			console.log(variableParts, curFormula);
			let newFormula = variableParts[0];
			for (let p = 1; p < variableParts.length; p++)
			{
				let endIndex = variableParts[p].split("").findIndex((a) => a == ")");

				let varName = variableParts[p].substr(0, endIndex);
				let suffix = variableParts[p].substr(endIndex + 1, variableParts[p].length);

				let exists = unknownVariables.find((v) => v.nodeName == varName);
				let variable = exists
				if (!exists) 
				{
					variable = new Variable({nodeName: varName, component: _component}, unknownVariables.length);
					unknownVariables.push(variable);
				}

				newFormula += "" + variable.name + "" + suffix;
			}
			console.log("execute formula", newFormula);
				
			outputs.push(eval(newFormula));
		}

		console.log('quantum state', trulyUnknownVariables);
		return outputs;

		function nand(a, b) {
			if (typeof a != 'boolean') 
			{
				trulyUnknownVariables.push(unknownVariables[a]);
				a = unknownVariables[a].getNode().turnedOn;
			}
			if (typeof b != 'boolean') 
			{
				trulyUnknownVariables.push(unknownVariables[b]);
				b = unknownVariables[b].getNode().turnedOn;
			}

			if (typeof a == 'boolean' && typeof b == 'boolean') return !(a && b);
			console.log('came here somehow')
			return false;
		};
	}


	function Variable({nodeName, component}, _index) {
		this.nodeName 	= nodeName;
		this.name 		= _index;

		this.getNodeState = function() {
			return this.getNode().turnedOn;
		}
		this.getNode = function() {
			return component.getNodeById(this.nodeName)
		}

		this.merge = function(_var) {}

		this.getFormulaSet = function(_component) {
			let node = _component.getNodeById(this.nodeName);
			return Runner.createFormulaForOutput(node, newId());
		}
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



