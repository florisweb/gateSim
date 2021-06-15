

function _Builder() {
  this.list = [];


  this.setup = function() {
   
    this.update();
  }





  this.clickHandler = function(_position) {
    console.log('click', _position);


    let minSize = Infinity;
    let clickedItem = false;
    for (let item of this.list)
    {
      let clicked = item.isPointInside(_position);
      item.selected = false;
      if (!clicked) continue;

      let size = item.hitBox.value[0] * item.hitBox.value[1];
      if (size > minSize) continue;
      
      minSize = size;
      clickedItem = item;
    }

    if (!clickedItem) return;
    
    clickedItem.onclick();
    console.warn('clicked', clickedItem);
  }






  this.register = function(_component) {
    this.list.push(_component);
  }





  this.update = function() {
  }
}
