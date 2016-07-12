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

			_WidgetBase,
			_TemplatedMixin,
			_WidgetsInTemplateMixin,
			ContentPane,
			parser,
			ready,
			Library,
			Deferred
        ){
	
	return declare("base.layout.PreviewCardOneLayout", [_WidgetBase, _TemplatedMixin], {
		templateString:"<div style='width: 100%;height:100%'><div style='width: 100%;height:100%' data-dojo-attach-point='mainContainer'></div></div>",
		_library: null,
		widgets:null,
		baseClass:'base.layout.PreviewCardOneLayout',
		_oneWidget:null,
		_shareData:null,
		constructor:function(args){
			lang.mixin(this,args);


			this._library = new Library();
			this.widgets = [];
			this._oneWidget = null;

			this._shareData = this.parameters.shareData?this.parameters.shareData:null;
		},
		
		placeAt: function(divId){
			var main = dojo.byId(divId);
			domConstruct.place(this.domNode, main);
			
		},
		isResize:false,
		postCreate:function() {
			if (this.isResize) {
				html.setStyle(this.domNode, 'width', 365 + "px");
				html.setStyle(this.domNode, 'height', 240 + "px");
			}

			this.getWidgetx();
			this.createWidgets();
		},
		startup: function(){

			//this.createWidgets();
		},
		
		resize: function(){
			
		},
		getWidgetx: function () {
			//获取左侧的panel
			var list = window.currentPageWidgets;
			var containerId = this.widget_id;
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				if (item.container == containerId && item.parameters.region == "view") {
					this._oneWidget = item;
				}
			}
		},

		createWidgets:function(){
			var widgets = [this._oneWidget];
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

							if(cfg.parameters.region=="view"){
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
							throw "Error create instance:" + cfg.id + ". " + error;
						}
					}
				}
			}), lang.hitch(this,function (err) {
				var errors = [err];
				Logger.error(errors);
			}));
		}
		
	});
});