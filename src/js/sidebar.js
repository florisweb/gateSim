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
  let Menu = OptionMenu.create();
  let CurMenuComponent = false;
  Menu.addOption(
    'Edit', 
    function() {
      if (!CurMenuComponent) return;
      Builder.editComponent(CurMenuComponent);
      Menu.close();
    }, 
    'images/icons/changeIconDark.png'
  );
  Menu.addOption(
    'Remove', 
    async function() {
      if (!CurMenuComponent) return;
      await Server.removeComponent(CurMenuComponent.componentId);
      SideBar.componentList.updateComponentList();
      Menu.close();
    }, 
    'images/icons/removeIcon.png'
  );


  this.setup = function() {
    this.updateComponentList();
  }


  this.updateComponentList = async function() {
    await Server.getComponentList();
    HTML.componentHolder.innerHTML = '';
    for (let component of Server.components) this.addComponent(component);
  }


  this.addComponent = function(_component) {
    let element = document.createElement('div');
    element.className = 'component noselect';

    element.innerHTML =   "<div class='titleHolder text'></div>" + 
                          "<img class='icon optionIcon clickable' src='images/icons/optionIcon.png'>" + 
                          "<div class='text subText'>Native</div>";

    setTextToElement(element.children[0], _component.name);
    if (_component.creatorName) setTextToElement(element.children[2], 'By: ' + _component.creatorName);

    element.addEventListener('click', function(_e) {
      if (_e.target.classList.contains('optionIcon'))
      { 
        CurMenuComponent = _component;
        Menu.open(element.children[1]);
        return;
      } 
      World.curComponent.addComponent(ComponentManager.importComponent(_component));
    });




    HTML.componentHolder.append(element);
  }

}