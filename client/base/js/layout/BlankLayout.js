define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/html",
    "dojo/on",
    "base/Library",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin"
], function (declare,
             lang,
             domConstruct,
             html,
             on,
             Library,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin
) {
    /**
     * 单个布局类
     */

    return declare("base.layout.BlankLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString:"<div style='width: 100%;height: 100%'></div>",
        _library: null,
        _shareData:null,
        widgets:null,
        mainWidget: null,

        isResize:false,
        
        manual:null,

        constructor: function (args) {
        	//编码创建
        	this.manual = false;
            //还原属性
            this.mainWidget = null;
            this.widgets = null;
            this._shareData = null;

            lang.mixin(this, args);

            this._library = new Library();

            this._shareData = this.parameters.shareData?this.parameters.shareData:null;
        },

        placeAt: function (divId) {
            var main = dojo.byId(divId);
            domConstruct.place(this.domNode, main);

        },

        postCreate:function() {
            this.inherited(arguments);
            if (this.isResize) {
                html.setStyle(this.domNode, 'width', 365 + "px");
                html.setStyle(this.domNode, 'height', 240 + "px");
            }

            if(this.manual){
            	//代码添加的 不去自动加载子widget
            	return;
            }
            this.getWidgetx();
            this.createWidgets();
        },
        //动态添加
        addChild:function(widget,region){
        	if(region=="view"){
        		  domConstruct.place(widget.domNode, this.domNode); 
                  if (widget.startup) {
                      widget.startup();
                  }
                  if (widget.resize) {
                      widget.resize();
                  }
        		this.widgets.push(widget);
        	}
        },
        startup: function () {
            this.inherited(arguments);
            this.own(on(window, 'resize', lang.hitch(this, this.resize)));
        },

        resize: function () {
        	for(var i= 0,max = this.widgets.length ;i<max;i++){
				var widget = this.widgets[i];
				try{
					if(widget.resize){
						widget.resize();
					}
				}catch(e){
                    Logger.warn("widget【" + widget.widget_id + "】,resize方法," + e) ;
				}
			}
        },

        getWidgetx: function () {
            //获取左侧的panel
            var list = window.currentPageWidgets;
            var containerId = this.widget_id;
            for (var i = 0,max =list.length;i < max; i++) {
                var item = list[i];
                if (item.container == containerId && item.parameters.region == "view") {
                    this.mainWidget = item;
                    break;
                }
            }
        },
        createWidgets:function(){
            if(!this.mainWidget)return;
            var widgets = [this.mainWidget];
            this.widgets = [];
            Logger.time("createwidgets");
            this._library.loadModules(widgets).then(lang.hitch(this,function (modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg =  widgets[i];
                    if (Module) {
                        try {
                            if(this._shareData){
                                cfg.parameters["data"] = this._shareData;
                            }
                            var widget = new Module({
                                widget_id: cfg.id,
                                parameters: cfg.parameters
                            });
                            domConstruct.place(widget.domNode, this.domNode);

                            if (widget.startup) {
                                widget.startup();
                            }
                            if (widget.resize) {
                                widget.resize();
                            }
                        	this.widgets.push(widget);

                        } catch (error) {
                            Logger.error("错误创建widget:【" + cfg.id + "】," + error) ;
                        }
                    }
                }

                Logger.timeEnd("createwidgets");

            }), lang.hitch(this,function (err) {

                Logger.error("错误加载widget:," + err) ;

            }));
        },destroy:function(){

			for(var i=0;i<this.widgets.length;i++){
				var widget = this.widgets[i];
				try{
					if(widget.destroy){
						widget.destroy();
					}
				}catch(e){
                    Logger.error("错误销毁widget:【" + widget.widget_id + "】," + error) ;
				}
			}

            this.inherited(arguments);
        }
    });
});