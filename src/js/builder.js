

function _Builder() {
  let HTML = {
    nameHolder: $("#mainContent input.titleHolder")[0]
  }
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

  this.newChip = function(_inputs = 2, _outputs = 1) {
    this.cancelBuildingLine();
    World.clear(_inputs, _outputs);
  }


  this.setup = function() {
  }


  this.packageComponent = function() {
    let data            = World.curComponent.export();
    data.name           = HTML.nameHolder.value;
    data.componentId    = newId();
    HTML.nameHolder.value = null;
    ComponentManager.addComponent(data);
    return data;
  }





  this.cancelBuildingLine = function() {
    this.curBuildLine = false;
  }



  this.clickHandler = function(_position) {
    for (let item of this.list) item.selected = false;

    let clickedItem = HitBoxManager.getItemByPosition(_position, {mustBeClickable: true});
    if (clickedItem.isNode) 
    {
      if (this.curBuildLine)
      {
        if (this.curBuildLine.from.id == clickedItem.id) return this.cancelBuildingLine();
        if (clickedItem.isWorldInput) return;
        if (!clickedItem.isWorldOutput && !clickedItem.isInput) return;

        this.curBuildLine.to = clickedItem;


        // Check if this line already exists, if so remove it.
        for (let line of this.curBuildLine.from.fromLines)
        {
          if (line.to.index != this.curBuildLine.to.index || line.to.parent.id != this.curBuildLine.to.parent.id) continue;
          line.remove();
          this.curBuildLine = false;
          return;
        }

        World.curComponent.addComponent(this.curBuildLine);
        this.curBuildLine.to.run(0);

        this.curBuildLine = false;
        return;
      }

      if (clickedItem.isWorldOutput) return;
      if (!clickedItem.isWorldInput && clickedItem.isInput) return;

      this.curBuildLine = new LineComponent({
        from: clickedItem,
        to: mouseNode,
      });

      return;
    } 

    this.curSelectedItem = false;
    if (!clickedItem) return;
    this.curSelectedItem = clickedItem;
    clickedItem.onclick();
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
    let item = HitBoxManager.getItemByPosition(_position);
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

  this.unregister = function(_id) {
    for (let i = 0; i < this.list.length; i++)
    {
      if (this.list[i].id != _id) continue;

      this.list.splice(i, 1);
      return true;
    }
    return false;
  }





  this.update = function() {
  }
}
