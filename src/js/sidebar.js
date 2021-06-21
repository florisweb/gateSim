function _SideBar() {
  this.componentList = new _SideBar_componentList();
  this.setup = function() {
    this.componentList.setup();
  }

  this.searchPage = new _SideBar_page(1);
  this.componentPage = new _SideBar_page(0);

  this.curPage = this.componentPage;
}

function _SideBar_page(_index) {
  const Index = _index;
  const HTML = {
    pages: $('#sideBar .page'),
    page: $('#sideBar .page')[Index],
  }

  this.openState = false;
  this.open = function() {
    this.openState = true;
    for (let page of HTML.pages) page.classList.add('hide');
    HTML.page.classList.remove('hide');
    SideBar.curPage = this;
  }
}




function _SideBar_componentList() {
  let HTML = {
    headers: $('#sideBar .header'),

    favorites: {
      componentHolder: $('#sideBar .componentList.favorites .componentHolder')[0],
    },

    myComponents: {
      componentHolder: $('#sideBar .componentList.myComponents .componentHolder')[0],
    },
    componentHolder: $('#sideBar .componentList.favorites .componentHolder')[0],
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


  for (let header of HTML.headers) header.addEventListener(
    'click', 
    function() {
      if (this.children[0].classList.contains('close'))
      {
        this.children[0].classList.remove('close');
        this.parentNode.children[1].classList.remove('hide');
      } else {
        this.children[0].classList.add('close');
        this.parentNode.children[1].classList.add('hide');
      }
    }
  );






  this.setup = function() {
    this.updateComponentList();
  }


  this.updateComponentList = async function() {
    await Server.getComponentList();
    HTML.componentHolder.classList.remove('hide');
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