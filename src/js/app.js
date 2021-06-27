

let Server;
let HitBoxManager;
let World;
let Renderer;
let InputHandler;
let Builder;
let ComponentManager;
let SideBar;
let Popup;
let Runner;

const App = new function() {
	this.setup = async function() {
		Server 				= new _Server();
		HitBoxManager 		= new _HitBoxManager();
		Builder 			= new _Builder();
		ComponentManager 	= new _ComponentManager();
		SideBar 			= new _SideBar();
		Runner				= new _Runner();

  		World 				= new _World();
  		Renderer 			= new _Renderer();
  		InputHandler 		= new _InputHandler({canvas: worldCanvas});
  		Popup 				= new _Popup();

  		World.setup();

  		Renderer.setup();

  		await Server.getComponentList()
  		SideBar.setup();
  	}
}


App.setup();