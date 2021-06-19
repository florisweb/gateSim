



function _Popup() {
  this.nodeManager = new _Popup_nodeManager();




}


function _Popup_nodeManager() {
  let This = this;

  let inputList = new InputList();
  PopupComponent.call(this, {
    content: [
      inputList,
      new Button({
        title: '+ Add Input',
        floatLeft: true,
        onclick: addNode
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
        index: input.index,
        value: input,
        onclick: function() {
          let nodes = setInputs ? World.curComponent.inputs : World.curComponent.outputs;
          nodes[input.index].remove();
          setNodeList();
        }
      });
    }
  }
  function addNode() {
    let node;
    if (setInputs)
    {
      node = new WorldInput({name: ''}, World.curComponent, World.curComponent.inputs.length);
      World.curComponent.inputs.push(node);
    } else {
      node = new WorldOutput({name: ''}, World.curComponent, World.curComponent.outputs.length);
      World.curComponent.outputs.push(node);
    }

    node.enableHitBox();
    setNodeList();
  }


  this.saveNodeConfig = function() {
    for (let item of inputList.items)
    {
      item.value.name = item.getValue();
    }

    this.close();
  }
}