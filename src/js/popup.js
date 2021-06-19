



function _Popup() {
  this.nodeManager = new _Popup_nodeManager();




}


function _Popup_nodeManager() {
  let This = this;

  let inputList = new ItemList();
  PopupComponent.call(this, {
    content: [
      inputList,
      new Button({
        title: '+ Add Input',
        floatLeft: true,
        onclick: function() {
          let input = new WorldInput({
            name: 'test',
          }, World.curComponent, World.curComponent.inputs.length);
          World.curComponent.inputs.push(input);
          input.enableHitBox();

          setNodeList();
        }
      }),
      new VerticalSpace({height: 50}),

      new Button({
        title: 'Save',
        filled: true,
        onclick: function() {
          This.saveNodeConfig();
        }
      }),
      new Button({
        title: 'Close',
        onclick: function() {
          This.close();
        }
      }),
    ],
    onOpen: onOpen,
    onClose: function() {}
  });

  let setInputs = false;
  function onOpen(_openResolver, _setInputs = true) {
    setInputs = _setInputs;
    Popup.nodeManager.setTitle(setInputs ? 'Set inputs' : 'Set outputs');

    setNodeList();
  }

  function setNodeList() {
    inputList.removeAllItems();
    let nodes = setInputs ? World.curComponent.inputs : World.curComponent.outputs;
    for (let input of nodes)
    {
      inputList.addItem({
        title: input.name,
        icon: 'images/icons/addIcon.png',
        value: input,
        onclick: function() {console.log('click');}
      });
    }

  }


  this.saveNodeConfig = function() {

    this.close();
  }
}