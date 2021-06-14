


let World;
let Renderer;
let InputHandler;
const App = new function() {
	this.setup = function() {
  		World = new _World();
  		Renderer = new _Renderer();
  		InputHandler = new _InputHandler({canvas: worldCanvas});

  		World.setup(
  			[{name: 'input 1'}, {name: 'input 2'}, {name: 'input 3'}], 
  			[{name: 'output 1'}, {name: 'output 2'}]
  		);

  		Renderer.setup();
  	}
}


App.setup();