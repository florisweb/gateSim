


function _HitBoxManager() {
  this.list = [];

  this.register = function(_hitBoxItem) {
    this.list.push(_hitBoxItem);
  }


  this.getItemByPosition = function(_position, _config = {mustBeClickable: false, mustBeDraggable: false}) {
    let minArea = Infinity;
    let clickedItem = false;
    for (let item of this.list)
    {
      if (!item.getDepth) return console.warn("[!] HitBoxManager: Found an item that doesn't have a getDepth()-function", item);
      if (item.getDepth() > Renderer.maxRenderDepth) continue;
      if (_config.mustBeClickable && !item.clickable) continue;
      if (_config.mustBeDraggable && !item.draggable) continue;
      if (!item.isPointInside(_position)) continue;

      if (item.area > minArea) continue;
      minArea = item.area;
      clickedItem = item;
    }

    return clickedItem;
  }
}