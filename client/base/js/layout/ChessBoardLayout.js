define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/_base/html",
    "dojo/dom",
    "dojo/_base/xhr",
    "dojo/topic",
    "dojo/text!./template/ChessBoardLayout.html",
    "dojo/text!./css/ChessBoardLayout.css",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dojo/parser",
    "dojo/ready",
    "base/Library",
    "dojo/Deferred"

], function(
    declare,
    lang,
    array,
    domConstruct,
    domStyle,
    html,
    dom,
    xhr,
    topic,
    template,
    css,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ContentPane,
    parser,
    ready,
    Library,
    Deferred
) {

    return declare("base.layout.ChessBoardLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        _library: null,
        widgets: null,

        _mainWidget: [],
        _row: null,
        _column: null,

        constructor: function(args) {
            lang.mixin(this, args);
            this._library = new Library();
            this._row = this.parameters.row || 4;
            this._column = this.parameters.column || 4;
            this._margin = this.parameters.margin || 5;

            this._mainWidget = [];

            this.widgets = [];
            this.setCss(css);

        },

        placeAt: function(divId) {
            var main = dojo.byId(divId);
            domConstruct.place(this.domNode, main);

        },
        isResize: false,
        postCreate: function() {
            this.inherited(arguments);
            if (this.isResize) {
                html.setStyle(this.domNode, 'width', 365 + "px");
                html.setStyle(this.domNode, 'height', 240 + "px");
            }
            this.getWidgetx();
            this.createWidgets();
            topic.subscribe("base/layout/ChessBoardLayout", lang.hitch(this,function() {
                Logger.log("load finished");
                this.reorg();
            }));

        },
        reorg: function() {
            var oContentBox = document.getElementById(this.id);
            var row = this._row;
            var column = this._column;
            var margin = this._margin;
            var boxWidth = oContentBox.offsetWidth;
            var boxHeight = oContentBox.offsetHeight;
            var itemWidth = boxWidth / column - 2 * margin;
            var itemHeight = boxHeight / row - 2 * margin;

            var itemList = oContentBox.children;

            var layoutMap = [];
            for (var i = row * column; i > 0; i--) {
                layoutMap.push(0);
            };

            var itemListLen = itemList.length;
            var iItem = 0;
            for (var i = 0, len = layoutMap.length; i < len; i++) {
                if (layoutMap[i] == 1) { //如果位子被人占了 就跳到下一格，这里应该根据下一个加入元素的大小来确定给他留的地方够不够；简单起见，就不考虑这种情况了
                    continue;
                } else {
                    var _x = Math.floor(i % column);
                    var _y = Math.floor(i / column);
                    // var _left = (2 * _x + 1) * margin + _x * itemWidth;
                    // var _top = (2 * _y + 1) * margin + _y * itemHeight;
                    var _left = (2 * _x) * margin + _x * itemWidth;
                    var _top = (2 * _y) * margin + _y * itemHeight;
                    var _item = itemList[iItem];
                    var _itemX = _item.dataset.xspan;
                    var _itemY = _item.dataset.yspan;
                    var _width = _itemX * itemWidth + (_itemX - 1) * 2 * margin;
                    var _height = _itemY * itemHeight + (_itemY - 1) * 2 * margin;

                    _item.style.cssText = "margin:" + margin + "px;top:" + _top + "px;left:" + _left + "px;width:" + _width + "px;height:" + _height + "px;";

                    //预先占位
                    for (var j = 0; j < _itemX; j++) {
                        for (var k = 0; k < _itemY; k++) {
                            layoutMap[i + j + (k) * column] = 1;
                        }
                    }
                    iItem++;
                    if (iItem == itemListLen) { //所有的元素取完了就歇了
                        break;
                    };
                }

            };
        },
        startup: function() {
            this.inherited(arguments);
            // this.reorg();
        },

        resize: function() {

        },
        getWidgetx: function() {
            //获取左侧的panel
            var list = window.currentPageWidgets;
            var containerId = this.widget_id;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];

                if (item.container == containerId && item.parameters.region == "main") {
                    this._mainWidget.push(item);
                }

            }
        },

        createWidgets: function() {
            var widgets = this._mainWidget;
            this._library.loadModules(widgets).then(lang.hitch(this, function(modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg = widgets[i];
                    if (Module) {
                        try {
                            var widget = new Module({
                                widget_id: cfg.id,
                                parameters: cfg.parameters
                            });

                            // if(cfg.parameters.region=="left"){
                            // 	domConstruct.place( widget.domNode, this.leftContainer);
                            // }
                            // if(cfg.parameters.region=="main"){
                            // 	domConstruct.place(widget.domNode, this.mainContainer);
                            // }
                            // if(cfg.parameters.region=="bottom"){
                            // 	domConstruct.place(widget.domNode, this.bottomContainer);
                            // }
                            this.mainContainer.appendChild(widget.domNode);
                            if (widget.startup) {
                                widget.startup();
                            }
                            if (widget.resize) {
                                widget.resize();
                            }
                            this.widgets.push(widget);
                        } catch (error) {
                            throw "Error create instance:" + cfg.id + ". " + error;
                        }
                    }
                }
                topic.publish("base/layout/ChessBoardLayout");
            }), lang.hitch(this, function(err) {
                var errors = [err];
                Logger.error(errors);
            }));
        },
        destroy: function() {
            this.inherited(arguments);
            Logger.log("删除了");


            for (var i = 0; i < this.widgets.length; i++) {
                var widget = this.widgets[i];
                if (widget.destroy) {
                    widget.destroy();
                }
            }
        }
    });
});
