

function _Builder() {
  let HTML = {
    nameHolder: $("#mainContent input.titleHolder")[0]
  }
  this.list = [];
  this.dragging = false;
  this.curDragItem = false;
  this.curBuildLines = [];
  this.curSelectedItem = false;

  let mousePosition = new Vector(0, 0);

  function MouseNode(_relativeIndex) {
    this.relativeIndex = _relativeIndex;
    this.getPosition = function() {
      return mousePosition.copy().add(new Vector(0, this.relativeIndex * (nodeRadius + inOutPutMargin) * 2));
    }
    this.parent = {
      getDepth: function() {
        return 0;
      }
    }
  }

  let curEditComponent = false;
  this.editComponent = function(_component) {
    World.import(_component);
    curEditComponent = _component
    HTML.nameHolder.value = _component.name;
  }

  this.newChip = function(_inputs = 2, _outputs = 1) {
    curEditComponent = false;
    HTML.nameHolder.value = null;
    HTML.nameHolder.focus();
    this.cancelBuildingLine();
    World.clear(_inputs, _outputs);
  }


  this.setup = function() {
  }


  this.packageComponent = async function() {
    let data            = World.curComponent.export();
    data.name           = HTML.nameHolder.value;
    data.componentId    = newId();
    HTML.nameHolder.value = null;

    if (curEditComponent) data.componentId = curEditComponent.componentId;
    return await ComponentManager.addComponent(data);
  }





  this.cancelBuildingLine = function() {
    this.curBuildLines = [];
  }



  this.addBuildLine = function({from, relativeIndex = 0}) {
    let line = new LineComponent({
      from: from,
      to: new MouseNode(relativeIndex),
    });
    line.relativeIndex = relativeIndex;
    this.curBuildLines.push(line);
  }



  this.clickHandler = function(_position, _event) {
    for (let item of this.list) item.selected = false;

    let clickedItem = HitBoxManager.getItemByPosition(_position, {mustBeClickable: true});
    if (clickedItem.isNode) 
    {
      if (this.curBuildLines.length)
      {
        // === MultipleLineAdder ===
        if (_event.shiftKey)
        {
          if (clickedItem.parent.id != this.curBuildLines[0].from.parent.id) return;
          if (clickedItem.index == this.curBuildLines[0].from.index) return this.cancelBuildingLine();
          
          let deltaIndex = clickedItem.index - this.curBuildLines[0].from.index;
          let isNegative = deltaIndex < 0;
          deltaIndex = Math.abs(deltaIndex);

          let outputs = this.curBuildLines[0].from.isWorldInput ? this.curBuildLines[0].from.parent.inputs : this.curBuildLines[0].from.parent.outputs;
          for (let i = 1; i < deltaIndex + 1; i++)
          {
            let dIndex = i * (1 - isNegative * 2);
            let index = this.curBuildLines[0].from.index + dIndex;
            
            if (!outputs[index]) continue;
            this.addBuildLine({
              from: outputs[index],
              relativeIndex: dIndex
            });
          }

          return;
        }



        // === Finish lines ===
        if (this.curBuildLines[0].from.id == clickedItem.id) return this.cancelBuildingLine();
        if (clickedItem.isWorldInput) return;
        if (!clickedItem.isWorldOutput && !clickedItem.isInput) return;

        let startIndex = clickedItem.index;
        let inputs = clickedItem.isWorldOutput ? clickedItem.parent.outputs : clickedItem.parent.inputs;

        for (let i = 0; i < this.curBuildLines.length; i++)
        {
          let index = startIndex + this.curBuildLines[i].relativeIndex;
          if (!inputs[index]) continue;
          this.curBuildLines[i].to = inputs[index];

          // Check if this line already exists, if so remove it.
          let removedLine = false;
          for (let line of this.curBuildLines[i].from.fromLines)
          {
            if (line.to.index != index || line.to.parent.id != this.curBuildLines[i].to.parent.id) continue;
            line.remove();
            removedLine = true;
            break;
          }

          if (removedLine) continue;

          World.curComponent.addComponent(this.curBuildLines[i]);
          this.curBuildLines[i].to.run(0);
        }

        this.curBuildLines = [];
        return;
      }

      // === Add the first line ===
      if (clickedItem.isWorldOutput) return;
      if (!clickedItem.isWorldInput && clickedItem.isInput) return;
      
      this.addBuildLine({
        from: clickedItem,
        relativeIndex: 0
      });
      return;
    } 

    this.curSelectedItem = false;
    if (!clickedItem) return;
    if (clickedItem.id != World.curComponent.id) this.curSelectedItem = clickedItem;
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
    let item = HitBoxManager.getItemByPosition(_position, {mustBeDraggable: true});
    if (!item || !item.draggable) return;
    this.curDragItem = item;
    this.dragging = true;
  }

  this.onDrag = function(_position, _delta) {
    if (!this.dragging || !this.curDragItem) return this.onDragEnd();

    this.curDragItem.drag(_delta);
  }
  
  this.onDragEnd = function() {
    if (this.curDragItem) this.curDragItem.dragEnd();
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
