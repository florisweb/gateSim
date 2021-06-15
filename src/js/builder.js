

function _Builder() {
  this.list = [];
  this.dragging = false;
  this.curDragItem = false;


  this.setup = function() {
   
    this.update();
  }





  this.clickHandler = function(_position) {
    for (let item of this.list) item.selected = false;
    let clickedItem = getItemByPosition(_position);
    if (!clickedItem) return;
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


  this.onDragStart = function(_position) {
    let item = getItemByPosition(_position);
    if (!item) return;
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

  }





  this.register = function(_component) {
    this.list.push(_component);
  }





  this.update = function() {
  }
}
