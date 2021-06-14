# gateSim

new WorldComponent extends DataComponent

new DataComponent
- id
- inputs [{name}]
- outputs [{name}]
- contents: [
	new LineComponent(),
	new DataComponent(),
]

new LineComponent({
	from: 
		- input: {id: 'input', index: index},
		- component: {id: componentId, index: index},
	to:
		- output {id: 'output', index: index},
		- component: {id: componentId, index: index},
})
