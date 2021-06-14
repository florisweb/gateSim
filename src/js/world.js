
function _World() {


  this.setup = function(_inputs, _outputs) {
    this.curComponent = new CurComponent({
      name: 'CurComponent', 
      inputs: _inputs, 
      outputs: _outputs, 
      contents: []
    });
  }
  

}


function _Builder() {
  this.updates = 0;
  this.running = true;

  this.setup = function() {
    UI            = new _UI();
    
    Animator      = new _Animator();
    PhysicsEngine = new _PhysicsEngine();
    RenderEngine 	= new _RenderEngine();
    InputHandler 	= new _InputHandler();
    Builder       = new _Builder();

    window.onresize();
    this.update();
    RenderEngine.update();

    setTimeout(function () {
      RenderEngine.camera.zoomTo(4);
      // RenderEngine.camera.follow(PhysicsEngine.particles[Math.floor(PhysicsEngine.particles.length * Math.random())]);
      RenderEngine.camera.follow(PhysicsEngine.bodies[0]);
    }, 10);
  }



  this.maxFps = 0;
  let prevFrame = new Date();
  this.update = function() {
    this.updates++;

    let dt = new Date() - prevFrame;
    this.maxFps = Math.round(1000 / dt);

    let performance = dt / (1000 / fps);
    if (performance < 1 || performance > 50) performance = 1;
    window.performance = performance;
    
    PhysicsEngine.update(performance);

    if (!this.running) return;    

    let nextFrame = 1000 / fps - dt;
    window.nextFrame = nextFrame;
    setTimeout(function () {Game.update()}, nextFrame);
    prevFrame = new Date();
  }
}



window.onresize = function() {
  gameCanvas.width = gameCanvas.offsetWidth;
  gameCanvas.height = gameCanvas.offsetHeight;
  RenderEngine.camera.size = new Vector([
    gameCanvas.width,
    gameCanvas.height
  ]);
}





