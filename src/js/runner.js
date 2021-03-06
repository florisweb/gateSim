

function _Runner() {
	let This = this;
	this.activated = false;
	// this.runSpeed = 100;
	// this.autoRun = false;
	// this.instantMode = false;

	// let resolver;
	// let curPromise;
	// this.nextStep = function() {
	// 	resolver();
	// }
	// this.awaitNextStep = async function() {
	// 	if (Runner.instantMode) return;
	// 	if (curPromise) await curPromise;
	// 	curPromise = new Promise((resolve) => {
	// 		resolver = resolve;
	// 		if (!Runner.autoRun) return;
	// 		setTimeout(() => {
	// 			resolve();
	// 		}, Runner.runSpeed)
	// 	})
	// 	return curPromise;
	// }



	// this.loopCue = [];
	// this.addLoopedNode = function(_node) {
	// 	if (this.loopCue.find((node) => _node.id == _node.id)) return;
	// 	this.loopCue.push(_node);
	// }

	// this.curRunId;
	// let internalCurRunId;
	// this.run = async function(_fullRun = false) {
	// 	this.loopCue = [];
	// 	let runId = newId();
	// 	console.warn('run', runId);
	// 	this.curRunId = runId;
	// 	internalCurRunId = runId;

	// 	for (let input of World.curComponent.inputs)
	//     {
	//     	input.run(runId, _fullRun);
	//     }
	    
	//     let subLoop = 0;
	//     while (this.loopCue.length > 0 && internalCurRunId == runId)
	//     {
	//     	subLoop++;
	//     	await wait(this.runSpeed);
	//     	this.runLoopCue(subLoop, false); // Never run as _fullRun, because it will get stuck in a loop this way
	//     }
	// }
	// this.runLoopCue = function(_subLoop, _fullRun) {
	// 	this.curRunId = newId();
	// 	let newCue = Object.assign([], this.loopCue);
	// 	this.loopCue = [];
	// 	console.log('run loopCue', _subLoop, newCue);
	// 	for (let node of newCue)
	//     {
	//     	node.run(0, this.curRunId, _fullRun);
	//     }
	// }



	this.modelNeedsUpdate = function() {modelUpToDate = false}

	this.run = async function() {
		if (!modelUpToDate) await this.prepareRun();
		let result = this.evaluateModel(World.curComponent.inputs.map((_inp) => _inp.turnedOn));
		for (let i = 0; i < result.length; i++) World.curComponent.outputs[i].turnedOn = result[i];
	}


	this.calcTruthTable = function() {
		if (internalVariables.length) return console.warn("A system with internal variable doesn't have a constant truth table.");
		let outputs = [];

		let maxOptions = Math.pow(2, World.curComponent.inputs.length);
		for (let i = 0; i < maxOptions; i++)
		{
			let curInput = createBinaryString(i).split("").reverse().map((a) => a == "1").splice(0, World.curComponent.inputs.length);
			outputs[i] = {input: curInput, output: this.evaluateModel(curInput)}
			console.log(i, ": " + curInput.join(" "), outputs[i].output);
		}
		return outputs;
	}



	let modelUpToDate = false;
	let formulas = [];
	let internalVariables = [];
	let internalPseudoVariables = [];
	this.prepareRun = async function() {
		let start = new Date();
		let formulaSet = await this.createOptimizedFormulas(World.curComponent);
		formulas 			= formulaSet.formulas;
		internalVariables 	= formulaSet.variables;

		modelUpToDate = true;
		for (let variable of internalVariables) 
		{
			variable.getNode().turnedOn = false;
			variable.prepare(false);
		}
		
		internalPseudoVariables = getPseudoVariables(formulaSet);

		console.log('Preparing took ' + (new Date() - start) + 'ms');
	}

	function clearUsedNodesArray(_component) {
		let nodes = [..._component.inputs, ..._component.outputs];
		for (let node of nodes) node.usedToNodes = [];
		for (let comp of _component.content)
		{
			if (comp.type == 'line') continue;
			clearUsedNodesArray(comp);
		}
	}

	this.getInfo = () => [formulas, internalVariables, internalPseudoVariables];

	this.evaluateModel = function(_inputs) {
		let start = new Date();
		// Evaluate the internal variables from their respective pseudo variables
		for (let variable of internalVariables)
		{
			let curFormula = variable.preparedFormula;
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
			}
			
			variable.getNode().turnedOn = eval(newFormula);
		}

		// Update the pseudovariables
		for (let pseudo of internalPseudoVariables) pseudo.getNode().turnedOn = evaluateFormula(pseudo.preparedFormula, _inputs);


		// Evalute the actual system
		let result = formulas.map((_formula) => evaluateFormula(_formula, _inputs));
		console.warn('Evaluating took ' + (new Date() - start) + "ms");
		return result;
	}

	function getPseudoVariables(_variableSet) {
		let pseudoVars = [];
		for (let variable of _variableSet.variables)
		{
			let parts = variable.preparedFormula.split("LOOP(");
			for (let p = 1; p < parts.length; p++)
			{
				let endIndex = parts[p].split("").findIndex((a) => a == ")");
				let varName = parts[p].substr(0, endIndex);
				
				if (pseudoVars.find((_var) => _var.nodeName == varName)) continue;
				pseudoVars.push(new Variable({nodeName: varName, component: World.curComponent}));
			}
		}

		// Update the pseudovariables
		for (let pseudo of pseudoVars) pseudo.prepare(true);
		return pseudoVars;
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
		return eval(curFormula);
	}





	this.createFormulas = async function(_component = World.curComponent) {
		let out = [];
		let variables = [];
		for (let output of _component.outputs)
		{
			let result = this.createFormulaForOutput(output);
			variables = mergeArrays(variables, result.variables, (a, b) => a.nodeName == b.nodeName);
			out.push(result.formula);
			console.warn("Finished calcing " + output.id, out.length / _component.outputs.length * 100 + "%");
			await wait(1);
		}
		return {
			formulas: out,
			variables: variables
		}
	}

	this.createOptimizedFormulas = async function(_component = World.curComponent) {
		let result = await this.createFormulas(...arguments);
		return optimizeVariables(result, _component);
	}

	function optimizeVariables(_variableSet, _component) {
		let optimizedVariables = [];
		let formulas = Object.assign([], _variableSet.formulas);

		for (let variable of _variableSet.variables)
		{
			let formulaSet = variable.getFormulaSet(_component); 
			let isSubstitutable = true;
			for (let subVar of formulaSet.variables)
			{
				if (
					!optimizedVariables.find((_var) => _var.nodeName == subVar.nodeName) && 
					_variableSet.variables.find((_var) => _var.nodeName == subVar.nodeName)
				) continue;
				isSubstitutable = false;
				break;
			}

			optimizedVariables.push(variable);

			variable.formula = false;
			if (!isSubstitutable) continue;
			variable.formula = formulaSet.formula;
		}
		// Substitue the result into the formulas
		let baseVariables = [];
		for (let i = 0; i < formulas.length; i++)
		{
			for (let variable of optimizedVariables)
			{
				if (!variable.formula) 
				{
					baseVariables = mergeArrays(baseVariables, [variable], (a, b) => a.nodeName == b.nodeName);
					continue;
				};
				let parts = formulas[i].split("LOOP(" + variable.nodeName + ")");
				formulas[i] = parts.join("(" + variable.formula + ")")
			}
		}
		
		return {
			formulas: formulas,
			variables: baseVariables
		};
	}



	this.createFormulaForOutput = function(_output, _allowedVariables = false, _originalOutput, _curPath = []) {
		// console.log('create formula for output', _output);
		if (!_originalOutput) _originalOutput = _output;
		let newPath = Object.assign([], _curPath);
		newPath.push(_output.id);

		let variables = [];
		let out = "";
		for (let lineTo of _output.toLines)
		{
			let parent = lineTo.from.parent;
			if (
				newPath.includes(lineTo.from.id) &&
				lineTo.from.id != _originalOutput.id
			) {
				if (typeof _allowedVariables != 'object' || _allowedVariables.includes(lineTo.from.id))
				{
					out = "LOOP(" + lineTo.from.id + ") || ";
					let variable = new Variable({nodeName: lineTo.from.id, component: lineTo.parent}, variables.length);
					variables.push(variable);
					continue;
				} 
				// else console.warn("Tried to use a not allowed variable", lineTo.from.id, 'of', _allowedVariables, _originalOutput.id);
			}


			if (parent.isWorldComponent) 
			{
				out += "IN" + lineTo.from.index + " || ";	
				continue;
			}

			if (out) out += " || ";
			if (parent.componentId == NandGateComponentId)
			{
				let resultA = this.createFormulaForOutput(parent.inputs[0], _allowedVariables, _originalOutput, newPath);
				let resultB = this.createFormulaForOutput(parent.inputs[1], _allowedVariables, _originalOutput, newPath);
				variables = variables.concat(resultA.variables).concat(resultB.variables);
				out += "nand(" + resultA.formula + ", " + resultB.formula + ")";
				continue;
			}

			
			let result = this.createFormulaForOutput(lineTo.from, _allowedVariables, _originalOutput, newPath);
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


	// function nodeDependantOn(_node, _dependantOnNode, _depth = 0) {
	// 	if (_node.parent.isWorldComponent) return false;
	// 	if (_depth > 5) return true;
	// 	for (let line of _node.toLines)
	// 	{
	// 		if (line.from.id == _dependantOnNode.id) return true;
	// 		if (nodeDependantOn(line.from, _dependantOnNode, _depth + 1)) return true;
	// 	}
	// 	return false;
	// }













	// this.calcComponentOutput = function(_component = World.curComponent, _inputs) {
	// 	let formulas = this.createFormulas(_component);
	// 	let outputs = [];
	// 	let unknownVariables = [];
	// 	let trulyUnknownVariables = [];

	// 	for (let formula of formulas)
	// 	{
	// 		let curFormula = formula;
	// 		for (let i = 0; i < _inputs.length; i++)
	// 		{
	// 			curFormula = curFormula.split("IN" + i).join(_inputs[i]);
	// 		}

	// 		let variableParts = curFormula.split("LOOP(");
	// 		console.log(variableParts, curFormula);
	// 		let newFormula = variableParts[0];
	// 		for (let p = 1; p < variableParts.length; p++)
	// 		{
	// 			let endIndex = variableParts[p].split("").findIndex((a) => a == ")");

	// 			let varName = variableParts[p].substr(0, endIndex);
	// 			let suffix = variableParts[p].substr(endIndex + 1, variableParts[p].length);

	// 			let exists = unknownVariables.find((v) => v.nodeName == varName);
	// 			let variable = exists
	// 			if (!exists) 
	// 			{
	// 				variable = new Variable({nodeName: varName, component: _component}, unknownVariables.length);
	// 				unknownVariables.push(variable);
	// 			}

	// 			newFormula += "" + variable.name + "" + suffix;
	// 		}
	// 		console.log("execute formula", newFormula);
				
	// 		outputs.push(eval(newFormula));
	// 	}

	// 	console.log('quantum state', trulyUnknownVariables);
	// 	return outputs;

	// 	function nand(a, b) {
	// 		if (typeof a != 'boolean') 
	// 		{
	// 			trulyUnknownVariables.push(unknownVariables[a]);
	// 			a = unknownVariables[a].getNode().turnedOn;
	// 		}
	// 		if (typeof b != 'boolean') 
	// 		{
	// 			trulyUnknownVariables.push(unknownVariables[b]);
	// 			b = unknownVariables[b].getNode().turnedOn;
	// 		}

	// 		if (typeof a == 'boolean' && typeof b == 'boolean') return !(a && b);
	// 		console.log('came here somehow')
	// 		return false;
	// 	};
	// }


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

		this.getFormulaSet = function(_component, _userRequiredVars = false) {
			let node = _component.getNodeById(this.nodeName);
			return Runner.createFormulaForOutput(node, _userRequiredVars ? internalVariables.map((_var) => _var.nodeName) : false);
		}

		this.preparedFormula = false;
		this.prepare = function(_userRequiredVars = false) {
			this.preparedFormula = this.getFormulaSet(World.curComponent, _userRequiredVars).formula;
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



function createBinaryString(nMask) {
  // nMask must be between -2147483648 and 2147483647
  if (nMask > 2**31-1) 
     throw "number too large. number shouldn't be > 2**31-1"; //added
  if (nMask < -1*(2**31))
     throw "number too far negative, number shouldn't be < 2**31" //added
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  sMask=sMask.replace(/\B(?=(.{8})+(?!.))/g, " ") // added
  return sMask;
}

function mergeArrays(_a, _b, _compareFunc) {
	let newArray = Object.assign([], _a);
	for (let entry of _b)
	{
		if (newArray.findIndex((a) => _compareFunc(a, entry)) != -1) continue;
		newArray.push(entry);
	}
	return newArray;
}

async function wait(_length) {
	return new Promise(function (resolve) {setTimeout(resolve, _length)});
}
let nand = (a, b) => !(a && b);