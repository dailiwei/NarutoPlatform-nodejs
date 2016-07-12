define(function(){
	var scroll = {};
	var _wheelData = -1;
	function bind(obj, type, handler) {
		var node = typeof obj == "string" ? $(obj) : obj;
		if (node.addEventListener) {
			node.addEventListener(type, handler, false);
		} else if (node.attachEvent) {
			node.attachEvent('on' + type, handler);
		} else {
			node['on' + type] = handler;
		}
	}
	function mouseWheel(obj, handler) {
		var node = typeof obj == "string" ? $(obj) : obj;
		bind(node, 'mousewheel', function(event) {
			var data = -getWheelData(event);
			handler(data);
			if (document.all) {
				window.event.returnValue = false;
			} else {
				event.preventDefault();
			}

		});
		// 火狐
		bind(node, 'DOMMouseScroll', function(event) {
			var data = getWheelData(event);
			handler(data);
			event.preventDefault();
		});
		function getWheelData(event) {
			var e = event || window.event;
			return e.wheelDelta ? e.wheelDelta : e.detail * 40;
		}
	}

	function addScroll() {}
	addScroll.prototype = {
		init : function(mainBox, contentBox, className) {
			contentBox.style.position= "absolute";
			contentBox.style.left= "0px";
			contentBox.style.top= "0px";
			var scrollDiv = this._createScroll(mainBox, className);
			this._resizeScorll(scrollDiv, mainBox, contentBox);
			this._tragScroll(scrollDiv, mainBox, contentBox);
			this._wheelChange(scrollDiv, mainBox, contentBox);
			this._clickScroll(scrollDiv, mainBox, contentBox);
		},
		// 创建滚动条
		_createScroll : function(mainBox, className) {
			var _scrollBox = document.createElement('div')
			var _scroll = document.createElement('div');
			var span = document.createElement('span');
			_scrollBox.appendChild(_scroll);
			_scroll.appendChild(span);
			_scroll.style.width = '10px';
			_scroll.style.position = 'absolute';
			_scroll.style.top = '0px';
			_scroll.style.background = '#ccc';
			_scroll.style.borderRadius = '5px';
			_scroll.style.cursor = "pointer";
			mainBox.appendChild(_scrollBox);
			return _scroll;
		},
		// 调整滚动条
		_resizeScorll : function(element, mainBox, contentBox) {
			var p = element.parentNode;
			var conHeight = contentBox.offsetHeight;
			var _width = mainBox.clientWidth;
			var _height = mainBox.clientHeight;
			var _scrollWidth = element.offsetWidth;
			var _left = _width - _scrollWidth;
			p.style.width = _scrollWidth + "px";
			p.style.height = _height + "px";
			p.style.left = _left + "px";
			p.style.position = "absolute";
			contentBox.style.width = (mainBox.offsetWidth - _scrollWidth)
					+ "px";
			var _scrollHeight = parseInt(_height * (_height / conHeight));
			if (_scrollHeight >= mainBox.clientHeight) {
				element.parentNode.style.display = "none";
			}
			element.style.height = _scrollHeight + "px";
		},
		// 拖动滚动条
		_tragScroll : function(element, mainBox, contentBox) {
			var mainHeight = mainBox.clientHeight;
			var _scrolling = false;
			element.onmousedown = function(event) {
				this.style.background = "#444";
				var _this = this;
				var _scrollTop = element.offsetTop;
				var e = event || window.event;
				var top = e.clientY;
				_scrolling = true;
				// this.onmousemove=scrollGo;
				document.onmousemove = scrollGo;
				document.onmouseup = function(event) {
					_this.style.background = "#ccc";
					_scrolling = false;
					this.onmousemove = null;
				}
				function scrollGo(event) {
					var e = event || window.event;
					var _top = e.clientY;
					var _t = _top - top + _scrollTop;
					if (_t > (mainHeight - element.offsetHeight)) {
						_t = mainHeight - element.offsetHeight;
					}
					if (_t <= 0) {
						_t = 0;
					}
					element.style.top = _t + "px";
					contentBox.style.top = -_t
							* (contentBox.offsetHeight / mainBox.offsetHeight)
							+ "px";
					_wheelData = _t;
				}
			}
			element.onmouseover = function() {
				this.style.background = "#444";
			}
			element.onmouseout = function() {
				if(!_scrolling)this.style.background = "#ccc";
			}
		},
		// 鼠标滚轮滚动，滚动条滚动
		_wheelChange : function(element, mainBox, contentBox) {
			var node = typeof mainBox == "string" ? $(mainBox) : mainBox;
			var flag = 0, rate = 0, wheelFlag = 0;
			if (node) {
				mouseWheel(
						node,
						function(data) {
							wheelFlag += data;
							if (_wheelData >= 0) {
								flag = _wheelData;
								element.style.top = flag + "px";
								wheelFlag = _wheelData * 12;
								_wheelData = -1;
							} else {
								flag = wheelFlag / 12;
							}
							if (flag <= 0) {
								flag = 0;
								wheelFlag = 0;
							}
							if (flag >= (mainBox.offsetHeight - element.offsetHeight)) {
								flag = (mainBox.clientHeight - element.offsetHeight);
								wheelFlag = (mainBox.clientHeight - element.offsetHeight) * 12;

							}
							element.style.top = flag + "px";
							contentBox.style.top = -flag
									* (contentBox.offsetHeight / mainBox.offsetHeight)
									+ "px";
						});
			}
		},
		_clickScroll : function(element, mainBox, contentBox) {
			var p = element.parentNode;
			p.onclick = function(event) {
				var e = event || window.event;
				var t = e.target || e.srcElement;
				var sTop = document.documentElement.scrollTop > 0 ? document.documentElement.scrollTop
						: document.body.scrollTop;
				var top = mainBox.offsetTop;
				var _top = e.clientY + sTop - top - element.offsetHeight
						/ 2;
				if (_top <= 0) {
					_top = 0;
				}
				if (_top >= (mainBox.clientHeight - element.offsetHeight)) {
					_top = mainBox.clientHeight - element.offsetHeight;
				}
				if (t != element) {
					element.style.top = _top + "px";
					contentBox.style.top = -_top
							* (contentBox.offsetHeight / mainBox.offsetHeight)
							+ "px";
					_wheelData = _top;
				}
			}
		}
	}
//	scroll.instance = addScroll;
	return new addScroll();
});