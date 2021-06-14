


let World;
const App = new function() {
	this.setup = function() {
  		World = new _World();
  		World.setup({
  			inputs: [
  				{name: 'input'}
  			], 
  			outputs: [
  				{name: 'output'}
  			]
  		});
  		
  	}
}


App.setup();