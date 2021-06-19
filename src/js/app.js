


let HitBoxManager;
let World;
let Renderer;
let InputHandler;
let Builder;
let ComponentManager;
let SideBar;
let Popup;

const App = new function() {
	this.setup = function() {
		HitBoxManager 		= new _HitBoxManager();
		Builder 			= new _Builder();
		ComponentManager 	= new _ComponentManager();
		SideBar 			= new _SideBar();

  		World 				= new _World();
  		Renderer 			= new _Renderer();
  		InputHandler 		= new _InputHandler({canvas: worldCanvas});
  		Popup 				= new _Popup();

  		World.setup();

  		Renderer.setup();
  		SideBar.setup();
  	}
}


App.setup();