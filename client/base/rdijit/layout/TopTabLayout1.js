///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-14 15：25
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/html',
        'dojo/on',
        'dojo/query',
        'dojo/NodeList-manipulate',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        './ViewStack2',
        '../utils',
        "dojo/dom-construct",
        "base/Library",
        "dojo/Deferred"
    ],
    function(declare,
        lang,
        array,
        html,
        on,
        query,
        nlm,
        _WidgetBase,
        _TemplatedMixin,
        ViewStack,
        utils,
        domConstruct,
        Library,
        Deferred
    ) {
        return declare([_WidgetBase, _TemplatedMixin], {


            'baseClass': 'rdijit-layout-tab3',
            declaredClass: 'rdijit.layout.TabContainer3',
            way: "left",
            templateString: '<div style="width: 100%;height:100%">' +
                '<div style="width:100%;height:50px;background-color: white;text-align: center">' +
                '<div  data-dojo-attach-point="controlNode" style="display:table;width:100%;height:100%"></div>' +
                '</div>' +
                '<div style="position: absolute;top:50px;bottom:0px;padding:7px;width:100%;box-shadow: 0 0 3px #888;" data-dojo-attach-point="containerNode"></div>' +
                '</div>',
            _library: null,
            _initTabAuto: true, //一次性全加载展示
            _currentWidget: null,
            panels:null,
            constructor: function(args) {
                declare.safeMixin(this, args);

                this._library = new Library();

                // if(this.parameters.panels){
                //     this.tabs =  this.parameters.panels;
                // }else if(this.parameters.parameters.panels){
                //     this.tabs = this.parameters.parameters.panels;
                // }else if(this.parameters.parameters.parameters.panels){
                //     this.tabs = this.parameters.parameters.parameters.panels;
                // }
                this.getPanels();
                this.tabs = this.panels;
                this.tabList = [];
            },
            getPanels:function(){//从全局去过滤自己的widget
                this.panels = [];
                var list = window.currentPageWidgets;
                var containerId = this.widget_id;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    if (item.container == containerId && item.parameters.region == "view") {
                        this.panels.push(item);
                    }
                }
            },
            postCreate: function() {
                this.inherited(arguments);
                if (this.tabs.length === 0) {
                    return;
                }
                this.controlNodes = [];
                //两种方式，上来挨个初始化，或者点击在初始化
                this.viewStack = new ViewStack(null, this.containerNode);
                if (this.isNested) {
                    html.addClass(this.domNode, 'nested');
                }

                array.forEach(this.tabs, function(tabConfig, index) {
                    this._createTab(tabConfig, index);
                }, this);
            },
            tabList: null,
            getWidgets: function(widget, index) {
                var deffer = new Deferred();

                var widgets = this._library.toWidgetArray(widget);
                this._library.loadModules(widgets).then(lang.hitch(this,function (modules) {

                    for (var i = 0; i < modules.length; i++) {
                        var Module = modules[i];
                        var cfg = widgets[i];
                        if (Module) {
                            try {
                                var widget = new Module({
                                    widget_id: cfg.id,
                                    parameters: cfg.parameters
                                });
                                widget.domNode.label = widget.parameters.i18nLabel;
                                this.tabList[index] = {
                                    "label": widget.parameters.i18nLabel,
                                    "widget": widget
                                };
                                this.viewStack.addView(widget.domNode); // 向面板添加
                                if (widget.startup) {
                                    widget.startup();
                                }
                                if (widget.resize) {
                                    widget.resize();
                                }
                                deffer.resolve(widget);
                            } catch (error) {
                                throw "Error create instance:" + cfg.id + ". " + error;
                            }
                        }
                    }
                }), lang.hitch(this,function (err) {
                    var errors = [err];
                    console.error(errors);
                }));

                return deffer;
            },

            startup: function() {
                this.inherited(arguments);
                if (!this.viewStack) {
                    this.viewStack = new ViewStack(null, this.containerNode);
                }
                //this.controlNodes = [];
                //把那几个widget加载过来创建了，然后添加
                this.getWidgets(this.tabs[0], 0).then(lang.hitch(this, function(widget) {
                    if (this.selected) {
                        this.selectTab(this.selected);
                    } else if (this.tabs.length > 0) {
                        this.selectTab(0);
                    }
                    utils.setVerticalCenter(this.domNode);
                }));
            },

            _createTab: function(tabConfig, index) {
                var ctrlNode;
                ctrlNode = html.create("div", {
                    'class': 'iconItem'
                });
                var imgNode = html.create('i', {
                    "class": tabConfig.parameters.icon
                }, ctrlNode);

                var label = html.create('span', {
                    innerHTML: " " + tabConfig.parameters.i18nLabel,
                    style: "vertical-align: middle;"
                }, ctrlNode);

                domConstruct.place(ctrlNode, this.controlNode);

                this.viewStack.viewType = 'dom';
                //this.viewStack.addView(tabConfig.content);//向面板添加
                this.own(on(ctrlNode, 'click', lang.hitch(this, this.onSelect, index)));
                ctrlNode.label = tabConfig.parameters.i18nLabel;
                this.controlNodes.push(ctrlNode);
            },

            onSelect: function(index) {
                this.selectTab(index);
            },

            selectTab: function(index) {
                this._selectControl(index);
            },

            _selectControl: function(index) {
                var _widget = this.tabList[index] ? this.tabList[index].widget : null;
                array.forEach(this.controlNodes, function(ctrlNode) {
                    html.removeClass(ctrlNode, 'rdijit-state-selected');
                    //          for(var j=0;j<this.tabs.length;j++){
                    //            query('img',ctrlNode)[0].src = this.tabs[j].parameters.darkIcon;
                    //        }
                });
                var ctrlNode = this.controlNodes[index];
                html.addClass(ctrlNode, 'rdijit-state-selected');
                //        for(var j=0;j<this.tabs.length;j++){
                //            if(this.tabs[j].parameters.i18nLabel==title){
                //                query('img',ctrlNode)[0].src = this.tabs[j].parameters.selectedIcon;
                //                break;
                //            }
                //        }
                //判断初始过没
                if (!_widget) {
                    //加载
                    this.getWidgets(this.tabs[index], index).then(lang.hitch(this, function(widget) {
                        if (this._currentWidget && this._currentWidget.deactivate) {
                            this._currentWidget.deactivate();
                        }
                        this._currentWidget = widget;
                        if (widget.activate) {
                            widget.activate();
                        }
                        this.viewStack.switchView(this.tabList[index].label);
                    }));
                } else {
                    if (this._currentWidget && this._currentWidget.deactivate) {
                        this._currentWidget.deactivate();
                    }
                    this._currentWidget = _widget;
                    if (_widget.activate) {
                        _widget.activate();
                    }
                    this.viewStack.switchView(this.tabList[index].label);
                }
            },
            addChild: function(child) {
                this.tabs.push(child);
            },
            activate: function() {
                if (this._currentWidget) {
                    this._currentWidget.activate();
                }
            },
            deactivate: function() {
                if (this._currentWidget) {
                    this._currentWidget.deactivate();
                }
            }



        });
    });
