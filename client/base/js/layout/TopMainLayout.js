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
			"dojo/text!./template/TopMainLayout.html",
	        "dojo/text!./css/TopMainLayout.css",
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
	
	return declare("base.layout.TopMainLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString:template,
		_library: null,
		widgets:null,
		_topWidget:null,
		_mainWidget:null,
		_shareData:null,
		constructor:function(args){
			lang.mixin(this,args); 
			this._library = new Library();

			this.setCss(css);
			this._topWidget = null;
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

			if(this.parameters&&this.parameters.top_height){
				var height = this.parameters.top_height;
				this.top_height = height;
				dojo.style(this.topDiv, {
					'height': height+"px"
				});
				dojo.style(this.anTopContainer, {
					'top': height+"px"
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
				if (item.container == containerId && item.parameters.region == "top") {
					this._topWidget = item;
				}
				if (item.container == containerId && item.parameters.region == "main") {
					this._mainWidget = item;
				}
			}
		},

		createWidgets:function(){
			var widgets = [this._topWidget,this._mainWidget];
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
									/*width = cfg.parameters.position.width;

									dojo.style(this.topContainer, {
										'width': width+"px"
									});
									dojo.style(this.mainContainer, {
										'top': width+"px"
									});*/
								}

								domConstruct.place( widget.domNode, this.topContainer);
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