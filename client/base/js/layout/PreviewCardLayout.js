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
	        
			"dojo/text!./template/PreviewCardLayout.html",
			"dojo/text!./css/PreviewCardLayout.css",
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
			css,
			_WidgetBase,
			_TemplatedMixin,
			_WidgetsInTemplateMixin,
			ContentPane,
			parser,
			ready,
			Library,
			Deferred
        ){
	
	return declare("base.layout.PreviewCardLayout", [_WidgetBase, _TemplatedMixin], {
		templateString:template,
		_library: null,
		widgets:null,
		baseClass:'base.layout.PreviewCardLayout',
		_topWidget:null,
		_bottomWidget:null,
		_shareData:null,
		constructor:function(args){
			lang.mixin(this,args);

			this.setCss(css);

			this._library = new Library();
			this.widgets = [];
			this._topWidget = null;
			this._bottomWidget = null;

			this._shareData = this.parameters.shareData?this.parameters.shareData:null;
		},
		
		placeAt: function(divId){
			var main = dojo.byId(divId);
			domConstruct.place(this.domNode, main);
			
		},
		isResize:false,
		postCreate:function() {
			if (this.isResize) {
				html.setStyle(this.domNode, 'width', 364 + "px");
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
				if (item.container == containerId && item.parameters.region == "top") {
					this._topWidget = item;
				}
				if (item.container == containerId && item.parameters.region == "bottom") {
					this._bottomWidget = item;
				}
			}
		},

		createWidgets:function(){
			var widgets = [this._topWidget,this._bottomWidget];
			var width = null;
			var height = null;
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

							if(cfg.parameters.region=="top"){
								if(cfg.parameters.position){
									width = cfg.parameters.position.width;
//									height = cfg.parameters.position.height;
//									dojo.style(this.topContainer, {
//										'height': height+"px"
//									});

//									dojo.style(this.bottomContainer, {
//										'top': height+"px"
//									});
									dojo.style(this.topContainer, {
										'height': "100%"
									});
									dojo.style(this.bottomContainer, {
										'top': 0
									});
								}
								domConstruct.place( widget.domNode, this.topContainer);
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
		}
		
	});
});