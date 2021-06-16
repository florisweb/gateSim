


let World;
let Renderer;
let InputHandler;
let Builder;
let ComponentManager;
let SideBar;

const App = new function() {
	this.setup = function() {
		Builder 			= new _Builder();
		ComponentManager 	= new _ComponentManager();
		SideBar 			= new _SideBar();

  		World 				= new _World();
  		Renderer 			= new _Renderer();
  		InputHandler 		= new _InputHandler({canvas: worldCanvas});

  		World.setup(
  			[{name: 'input 1', turnedOn: true}, {name: 'input 2'}], 
  			[{name: 'output 1'}]
  		);

  		Renderer.setup();
  		SideBar.setup();
  	}
}


App.setup();