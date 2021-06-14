


let World;
let Renderer;
let InputHandler;
const App = new function() {
	this.setup = function() {
  		World = new _World();
  		Renderer = new _Renderer();
  		InputHandler = new _InputHandler({canvas: worldCanvas});

  		World.setup(
  			[{name: 'input 1', turnedOn: true}, {name: 'input 2'}], 
  			[{name: 'output 1'}]
  		);

  		Renderer.setup();
  	}
}


App.setup();