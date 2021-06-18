function _SideBar() {
  this.componentList = new _SideBar_componentList();
  this.setup = function() {
    this.componentList.setup();
  }
}



function _SideBar_componentList() {
  let HTML = {
    componentHolder: componentHolder
  }

  this.setup = function() {
    this.setComponentList(ComponentManager.components);
  }


  this.setComponentList = function(_list) {
    HTML.componentHolder.innerHTML = '';

    for (let component of _list) this.addComponent(component);
  }


  this.addComponent = function(_component) {
    let element = document.createElement('div');
    element.className = 'component noselect';

    element.innerHTML =   "<div class='titleHolder text'></div>" + 
                          "<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>" + 
                          "<div class='text subText'>By: Floris</div>";
                          // "<canvas class='componentPreview'></canvas>";
    
    setTextToElement(element.children[0], _component.name);
    element.addEventListener('click', function(_e) {
      if (_e.target.classList.contains('optionIcon')) return World.import(_component);
      World.curComponent.addComponent(ComponentManager.importComponent(_component));
    });

    HTML.componentHolder.append(element);
  }

}