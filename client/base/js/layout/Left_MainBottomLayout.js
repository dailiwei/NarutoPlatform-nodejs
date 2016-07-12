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
			"dojo/text!./template/Left_MainBottomLayout.html",
	        "base/_BaseWidget",
			"dijit/_TemplatedMixin",
			"dijit/_WidgetsInTemplateMixin",
			"dijit/layout/ContentPane",
			"dojo/parser",
			"dojo/ready",
	        "base/Library",
	        "dojo/Deferred"

        ],function(
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
			_WidgetBase,
			_TemplatedMixin,
			_WidgetsInTemplateMixin,
			ContentPane,
			parser,
			ready,
			Library,
			Deferred
        ){
	
	return declare("base.layout.Left_MainBottomLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString:template,
		_library: null,
		widgets:null,
		_leftWidget:null,
		_mainWidget:null,
		_bottomWidget:null,
		_shareData:null,
		constructor:function(args){
			lang.mixin(this,args);
			this._library = new Library();

			this._leftWidget = null;
			this._mainWidget = null;
			this._bottomWidget = null;
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
				if (item.container == containerId && item.parameters.region == "bottom") {
					this._bottomWidget = item;
				}
			}
		},

		createWidgets:function(){
			var widgets = [this._leftWidget,this._mainWidget,this._bottomWidget];
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
								domConstruct.place( widget.domNode, this.leftContainer);
							}
							if(cfg.parameters.region=="main"){
								domConstruct.place(widget.domNode, this.mainContainer);
							}
							if(cfg.parameters.region=="bottom"){
								domConstruct.place(widget.domNode, this.bottomContainer);
							}

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
			}), lang.hitch(this,function (err) {
				var errors = [err];
				Logger.error(errors);
			}));
		},destroy:function(){
			this.inherited(arguments);
			Logger.log("删除了");


			for(var i=0;i<this.widgets.length;i++){
				var widget = this.widgets[i];
				if(widget.destroy){
					widget.destroy();
				}
			}
		}
	});
});