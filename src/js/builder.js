

function _Builder() {
  this.list = [];
  this.dragging = false;
  this.curDragItem = false;
  this.curBuildLine = false;
  this.curSelectedItem = false;

  let mousePosition = new Vector(0, 0);
  let mouseNode = {
    getPosition: function() {
      return mousePosition;
    },
    parent: {
      getDepth: function() {
        return 0;
      }
    }
  }


  this.setup = function() {
  }


  this.cancelBuildingLine = function() {
    this.curBuildLine = false;
  }



  this.clickHandler = function(_position) {
    for (let item of this.list) item.selected = false;
    let clickedNode = getInOutputByPosition(_position);
    if (clickedNode) 
    {
      if (this.curBuildLine)
      {
        if (this.curBuildLine.from.id == clickedNode.id) return this.cancelBuildingLine();
        this.curBuildLine.to = clickedNode;
        World.curComponent.addComponent(this.curBuildLine);
        this.curBuildLine = false;
        return;
      }

      this.curBuildLine = new LineComponent({
        from: clickedNode,
        to: mouseNode,
      });

      console.warn('clicked node', clickedNode);
      return;
    } 

    let clickedItem = getItemByPosition(_position);
    this.curSelectedItem = false;
    if (!clickedItem) 
    {
      let nandGate = new NandGateComponent({position: mousePosition.copy()});
      World.curComponent.addComponent(nandGate);
      return;
    }
    this.curSelectedItem = clickedItem;
    clickedItem.onclick();
  }


  function getItemByPosition(_position) {
    let minSize = Infinity;
    let clickedItem = false;
    for (let item of Builder.list)
    {
      if (item.getDepth() > Renderer.maxRenderDepth) continue;

      let clicked = item.isPointInside(_position);
      if (!clicked) continue;

      let size = item.hitBox.value[0] * item.hitBox.value[1];
      if (size > minSize) continue;
      
      minSize = size;
      clickedItem = item;
    }

    return clickedItem;
  }


  function getInOutputByPosition(_position) {
    let clickedItem = false;
    for (let item of Builder.list)
    {
      if (item.getDepth() > Renderer.maxRenderDepth) continue;
      let nodes = [...item.inputs, ...item.outputs];
      for (let node of nodes)
      {
        if (!node.isPointInside(_position)) continue;
        return node;
      }
    }

    return false;
  }



  this.onDragStart = function(_position) {
    let item = getItemByPosition(_position);
    if (!item || !item.draggable) return;
    this.curDragItem = item;
    this.dragging = true;
  }

  this.onDrag = function(_position, _delta) {
    if (!this.dragging || !this.curDragItem) return this.onDragEnd();

    this.curDragItem.drag(_delta);
  }
  
  this.onDragEnd = function() {
    this.curDragItem = false;
    this.dragging = false;
  }








  this.handleMouseMove = function(_position) {
    mousePosition = _position;

  }





  this.register = function(_component) {
    this.list.push(_component);
  }





  this.update = function() {
  }
}
