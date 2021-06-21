
const OptionMenu = new function() {
	this.create = function(_ZIndex = 100) {
		let html = document.createElement("div");
		html.className = "optionMenuHolder hide";
		html.style.zIndex = _ZIndex;
		document.body.append(html);

		let Menu = new _OptionMenu_menu(html);


		document.body.addEventListener("click", function(_e) {
			if (_e.target.classList.contains("clickable")) return;
			if (isDescendant(html, _e.target)) return;
			Menu.close();
	    });

		return Menu;
	}
}


function _OptionMenu_menu(_self) {
	let HTML = {
		Self: _self,
		parent: _self.parentNode
	}

	let This = this;
	this.options = [];


	this.openState = false;
	this.open = function(_item, _relativePosition, _event) {
		if (!this.options.length) return;
		
		this.openState = true;
		moveToItem(_item, _relativePosition, _event);
		HTML.Self.classList.remove("hide");
	}


	this.close = function() {
		this.openState = false;
		HTML.Self.classList.add("hide");
	}

	this.enableAllOptions = function() {
		for (let option of this.options) option.enable();
	}
	this.showAllOptions = function() {
		for (let option of this.options) option.show();
	}

	this.removeAllOptions = function() {
		this.options = [];
		HTML.Self.innerHTML = "";
	}

	this.clickFirstOption = function() {
		let option = this.options[0];
		if (!option) return false;
		option.select();
		This.close();
		return true;
	}



	function removeOption(_option) {
		for (let i = 0; i < This.options.length; i++)
		{
			if (_option != This.options[i]) continue;
			This.options.splice(i, 1);
			return true;
		}
		return false;
	}


	this.addOption = function(_title = "", _onclick, _image = "") {
		let html = document.createElement("div");
		html.className = "optionItem clickable";
		html.innerHTML = "<div class='optionText'>Remove task</div>";
		
		setImageSource(_image, html);
		setTextToElement(html.children[1], _title);

		HTML.Self.append(html);
		

		let option = new function() {
			this.title = _title;
			this.html = html;

			this.remove = function() {
				removeOption(this);
				this.html.parentNode.removeChild(this.html);
			}

			this.disable = function() {
				this.html.classList.add("disabled");
			}

			this.enable = function() {
				this.html.classList.remove("disabled");
			}

			this.hide = function() {
				this.html.style.display = "none";
			}

			this.show = function() {
				this.html.style.display = "block";
			};
			this.select = function() {
				let close;
				try {
					close = _onclick();
				}
				catch (e) {return console.error("Optionmenu.option.click: An error accured", e)};
				if (close) This.close();
			}
		};

		html.onclick = option.select;

		this.options.push(option);
		return option;
	}


	const popupMargin = 20;
	function moveToItem(_item, _relativePosition = {left: 0, top: 0}, _event) {
		if (!_item) return false;
		HTML.Self.style.maxHeight = "none";

		let top = _item.getBoundingClientRect().top + HTML.parent.scrollTop + _relativePosition.top;
		let buttonY = top;
		let left = _item.getBoundingClientRect().left;
		if (_event) left = _event.clientX;
		left += _relativePosition.left;

		let maxLeft = document.body.offsetWidth - HTML.Self.offsetWidth - popupMargin;
		if (left > maxLeft) left = maxLeft;
		
		let desiredHeight = HTML.Self.offsetHeight;
		let spaceUnderButton = window.innerHeight - buttonY - popupMargin;
		let spaceAboveButton = buttonY - popupMargin + _item.offsetHeight;

		maxHeight = spaceUnderButton;
		if (buttonY > spaceUnderButton && spaceUnderButton < desiredHeight) 
		{
			if (desiredHeight > spaceAboveButton)
			{
				top = popupMargin;
				maxHeight = spaceAboveButton - 5 * 2; // - 10 because of padding
			} else {
				maxHeight = spaceAboveButton
				top = popupMargin + spaceAboveButton - desiredHeight;
			}
		}

		HTML.Self.style.left 		= left + "px";
		HTML.Self.style.top			= top + "px";
		HTML.Self.style.maxHeight 	= maxHeight + "px";
	}
}