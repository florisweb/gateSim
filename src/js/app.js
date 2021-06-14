


let World;
let Renderer;
let InputHandler;
const App = new function() {
	this.setup = function() {
  		World = new _World();
  		Renderer = new _Renderer();
  		InputHandler = new _InputHandler({canvas: worldCanvas});

  		World.setup({
  			inputs: [
  				{name: 'input'}
  			], 
  			outputs: [
  				{name: 'output'}
  			]
  		});

  		Renderer.setup();
  	}
}


App.setup();