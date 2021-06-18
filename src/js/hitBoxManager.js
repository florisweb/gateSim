


function _HitBoxManager() {
  this.list = [];

  this.register = function(_hitBoxItem) {
    if (!_hitBoxItem.getDepth) return console.warn("[!] HitBoxManager: Found an item that doesn't have a getDepth()-function", _hitBoxItem);
    if (_hitBoxItem.getDepth() > Renderer.maxRenderDepth) return;
    this.list.push(_hitBoxItem);
  }

  this.clear = function() {
    this.list = [];
  }
  this.unregister = function(_id) {
    for (let i = this.list.length - 1; i >= 0; i--)
    {
      if (this.list[i].hitBoxId != _id) continue;
      this.list.splice(i, 1);
      return true;
    }
    return false;
  }


  this.getItemByPosition = function(_position, _config = {mustBeClickable: false, mustBeDraggable: false}) {
    let minArea = Infinity;
    let clickedItem = false;
    for (let item of this.list)
    {
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