function _SideBar() {
  this.setup = function() {
    this.homePage.setup();
  }

  this.searchPage = new _SideBar_searchPage();
  this.homePage = new _SideBar_homePage();

  this.curPage = this.homePage;

  this.renderer = new _SideBar_renderer();
}

function _SideBar_page({index, onOpen}) {
  const Index = index;
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

    try {
      onOpen(...arguments);
    } catch (e) {console.warn('[!] Error while opening a tab:', this, e)}
  }
}


function _SideBar_homePage() {
  let This = this;
  _SideBar_page.call(this, {
      index: 0,
      onOpen: onOpen
  });
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

  function onOpen() {
    This.updateComponentList();
  }
  

  this.setup = function() {
    this.updateComponentList();
  }

  this.updateComponentList = async function() {
    await Server.getComponentList();
    HTML.componentHolder.innerHTML = '';
    for (let component of Server.components) HTML.favorites.componentHolder.append(SideBar.renderer.renderComponent(component));
  }
}





function _SideBar_searchPage() {
  let This = this;
  _SideBar_page.call(this, {
      index: 1,
      onOpen: onOpen
  });
  const HTML = {
    page: $('#sideBar .page.searchPage')[0],
    input: $('#sideBar .page.searchPage .inputField')[0],
    componentHolder: $('#sideBar .page.searchPage .componentHolder')[0]
  }
  HTML.input.oninput = function() {
    This.search(this.value);
  }

  function onOpen() {
    HTML.input.value = null;
    HTML.input.focus();
    setComponentList(Server.components);
  }


  this.search = function(_value) {
    let results = [];
    for (let item of Server.components)
    {
      item.score = similarity(item.name, _value);
      if (item.score < .5) continue;
      results.push(item);
    }
    results.sort(function(a, b) {
      return a.score < b.score;
    });

    if (!_value) results = Server.components;
    setComponentList(results);
  }

  function setComponentList(_list) {
    HTML.componentHolder.innerHTML = '';
    for (let item of _list) HTML.componentHolder.append(SideBar.renderer.renderComponent(item));
  }
}






function _SideBar_renderer() {
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
      SideBar.homePage.updateComponentList();
      Menu.close();
    }, 
    'images/icons/removeIcon.png'
  );



  this.renderComponent = function(_component) {
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

    return element;
  }
}