define([
			"dojo/_base/declare",
			"dojo/_base/lang",
			"dojo/_base/array",
	        "dojo/dom-construct",
	        "dojo/_base/html",
	        "dojo/topic",
			"dojo/text!./template/BootstrapLayout.html",
			"dojo/text!./css/BootstrapLayout.css",
	        "base/_BaseWidget",
			"dijit/_TemplatedMixin",
			"dijit/_WidgetsInTemplateMixin",
	        "base/Library"

        ],function(
	        declare,
	        lang,
			array,
    		domConstruct,
    		html,
    		topic,
			template,
			css,
			_WidgetBase,
			_TemplatedMixin,
			_WidgetsInTemplateMixin,
			Library
        ){
	
	return declare("base.layout.BootstrapLayout1", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString:template,
		_library: null,
		widgets:null,
		_leftWidget:null,
		_mainWidget:null,
		_shareData:null,
		constructor:function(args){
			lang.mixin(this,args);

			this.setCss(css);

			this._library = new Library();

			this._leftWidget = null;
			this._mainWidget = null;
			this.widgets = [];
			this._shareData = this.parameters.shareData?this.parameters.shareData:null;
		},
		
		placeAt: function(divId){
			var main = dojo.byId(divId);
			domConstruct.place(this.domNode, main);
			
		},
		isResize:false,
		postCreate:function() {
			this.inherited(arguments);
			if (this.isResize) {
				html.setStyle(this.domNode, 'width', 365 + "px");
				html.setStyle(this.domNode, 'height', 240 + "px");
			}

			if(this.parameters&&this.parameters.left_width){
				var width = this.parameters.left_width;

				dojo.style(this.leftContainer, {
					'width': width+"px"
				});
				dojo.style(this.mainContainer, {
					'left': width+"px"
				});
			}
			this.getWidgetx();
			this.createWidgets();
		},
		startup: function(){
			this.inherited(arguments);
		},
		
		resize: function(){
			
		},
		getWidgetx: function () {
			//获取左侧的panel
			var list = window.currentPageWidgets;
			var containerId = this.widget_id;
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				if (item.container == containerId && item.parameters.region == "left") {
					this._leftWidget = item;
				}
				if (item.container == containerId && item.parameters.region == "main") {
					this._mainWidget = item;
				}
			}
		},

		createWidgets:function(){
			var widgets = [this._leftWidget,this._mainWidget];
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

							if(cfg.parameters.region=="left"){
								if(cfg.parameters.position){
									width = cfg.parameters.position.width;

									dojo.style(this.leftContainer, {
										'width': width+"px"
									});
									dojo.style(this.mainContainer, {
										'left': width+"px"
									});
								}

								domConstruct.place( widget.domNode, this.leftContainer);
							}
							if(cfg.parameters.region=="main"){

								domConstruct.place(widget.domNode, this.mainContainer);
							}

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
				if(widget.destroy){
					widget.destroy();
				}
			}

			this.inherited(arguments);
		}
	});
});