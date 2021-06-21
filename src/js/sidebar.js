function _SideBar() {
  this.componentList = new _SideBar_componentList();
  this.setup = function() {
    this.componentList.setup();
  }
}



function _SideBar_componentList() {
  let HTML = {
    componentHolder: $('#sideBar .componentHolder')[0]
  }

  this.setup = function() {
    this.updateComponentList();
  }


  this.updateComponentList = function() {
    HTML.componentHolder.innerHTML = '';
    for (let component of Server.components) this.addComponent(component);
  }


  this.addComponent = function(_component) {
    let element = document.createElement('div');
    element.className = 'component noselect';

    element.innerHTML =   "<div class='titleHolder text'></div>" + 
                          "<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>" + 
                          "<div class='text subText'>Native</div>";
                          // "<canvas class='componentPreview'></canvas>";
    setTextToElement(element.children[0], _component.name);
    if (_component.creatorName) setTextToElement(element.children[2], 'By: ' + _component.creatorName);

    element.addEventListener('click', function(_e) {
      if (_e.target.classList.contains('optionIcon')) return World.import(_component);
      World.curComponent.addComponent(ComponentManager.importComponent(_component));
    });

    HTML.componentHolder.append(element);
  }

}