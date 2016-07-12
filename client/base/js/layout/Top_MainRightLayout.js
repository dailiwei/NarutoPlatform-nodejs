define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/_base/html",
	"dojo/_base/fx",
	"dojo/dom",
	"dojo/topic",

	"dojo/text!./template/Top_MainRightLayout.html",
	"dojo/text!./css/Top_MainRightLayout.css",
	"base/_BaseWidget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"base/Library",
	"dojo/Deferred"

],function(
	declare,
	lang,
	array,
	domConstruct,
	domStyle,
	html,
	fx,
	dom,
	topic,

	template,
	css,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Library,
	Deferred
){

	return declare("base.layout.Top_MainRightLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString:template,
		'baseClass' :'base-layout-Top_MainRightLayout',
		_library: null,
		widgets:null,
		_topWidget:null,
		_rightWidget:null,
		_mainWidget:null,
		_bottomWidget:null,
		_shareData:null,
		state:null,
		index:0,
		constructor:function(args){
			lang.mixin(this,args);

			this.setCss(css);

			this._library = new Library();

			this._topWidget  = null;
			this._rightWidget = null;
			this._mainWidget = [];
			this._bottomWidget = [];

			this.widgets = [];
			if(this.parameters){
				this._shareData = this.parameters.shareData?this.parameters.shareData:null;
			}else{
				this.parameters = {};
				this.parameters.right_width = 350;
			}

			this.state = "big";//默认是打开的
			this.isBottomShow = false;
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

			if(this.parameters&&this.parameters.right_width){
				var width = this.parameters.right_width;
				this.right_width = width;
				dojo.style(this.rightContainer, {
					'width': width+"px"
				});
				dojo.style(this.mainContainer, {
					'right': (width+8)+"px"
				});

				dojo.style(this.splitNode,"right",this.right_width+"px");
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
			if(this.parameters.right_hide){
				dojo.style(this.rightContainer, {
					'width':0+"px"
				});
				dojo.style(this.mainContainer, {
					'right': (8)+"px"
				});
				dojo.style(this.splitNode,{
					'right':'0px'
				});
				this.state = "small";
				dojo.style(this.rightContainer,"display","none");
			}
			if(this.manual){//添加个新的这样动态和自动都用
				return;
			}
			this.getWidgetx();
			this.createWidgets();

			if(this._mainWidget.length>1){//如果是两个的话
				html.setStyle(this.map2,"z-index","");//隐藏第二个 GIS
				html.setStyle(this.map1,"z-index","100");//隐藏第二个 GIS
				html.setStyle(this.changeBtn,"display","block");
			}


		},
		showSVG:function(){
			html.setStyle(this.map2,"z-index","");//隐藏第二个
			html.setStyle(this.map1,"z-index","100");//隐藏第二个
			html.removeClass(this.changeGIS,"active");
			html.addClass(this.changeSVG,"active");
		},
		showGIS:function(){
			html.setStyle(this.map1,"z-index","");//显示第-个
			html.setStyle(this.map2,"z-index","100");//隐藏第二个

			html.removeClass(this.changeSVG,"active");
			html.addClass(this.changeGIS,"active");
		},
		startup: function(){
			this.inherited(arguments);

            this.own(topic.subscribe("base/layout/floatLayout/panelBottomContainer/close",lang.hitch(this,this.bottomClose)));   
			//根据bottom 
			this.createBottomSubscribes();
		},

		resize: function(){

		},
		//编程方式添加
		addChild:function(item){
			var widget  = item.widget;
			if(item.region=="right"){
				domConstruct.place(  widget.domNode, this.rightContainer);
				this._rightWidget = widget;

				if ( widget.startup) {
					widget.startup();
				}
				if ( widget.resize) {
					widget.resize();
				}
			}else if(item.region=="main"){
				domConstruct.place(widget.domNode, this.map2);
				this._mainWidget = widget;

				if ( widget.startup) {
					widget.startup();
				}
				if ( widget.resize) {
					widget.resize();
				}
			}
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
				if (item.container == containerId && item.parameters.region == "right") {
					this._rightWidget = item;
				}
				if (item.container == containerId && item.parameters.region == "main") {
					this._mainWidget.push(item);
				}
				if (item.container == containerId && item.parameters.region == "bottom") {
					this._bottomWidget.push(item);
				}
			}
		},

		createWidgets:function(){
			var widgets = this._mainWidget;// [this._rightWidget];
			widgets = widgets.concat([this._rightWidget,this._topWidget]);
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

							if(cfg.parameters.region=="right"){

								domConstruct.place( widget.domNode, this.rightContainer);
								this._rightWidget = widget;
							}
							if(cfg.parameters.region=="top"){

								domConstruct.place( widget.domNode, this.topContainer);
								this._topWidget = widget;
							}
							if(cfg.parameters.region=="main"){

								if(cfg.parameters.type&&cfg.parameters.type=="svg"){
									domConstruct.place(widget.domNode, this.map1);
									if(cfg.parameters.title){
										this.changeSVG.innerHTML = cfg.parameters.title;
									}
									if(cfg.parameters.active&&cfg.parameters.active==1){
										this.showGIS();
									}
//									this._mainWidget = widget;
									this.index++
								}else{
									domConstruct.place(widget.domNode, this.map2);
									if(cfg.parameters.title){
										this.changeGIS.innerHTML = cfg.parameters.title;
									}
								}

							}

							if (widget.startup) {
								widget.startup();
							}

							if (widget.resize) {
								widget.resize();
							}


							this.widgets.push(widget);
						} catch (e) {
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
		,
		//改变大小
		_changeState:function(){
			if(this.state == "big"){
				dojo.style(this.rightContainer, {
					'width':0+"px"
				});
				dojo.style(this.mainContainer, {
					'right': (8)+"px"
				});
				dojo.style(this.splitNode,{
					'right':'0px'
				});
				this.state = "small";
				dojo.style(this.rightContainer,"display","none");
			}else{
				if(this.right_width){
					var width = this.right_width;
					this.right_width = width;
					dojo.style(this.rightContainer, {
						'width': width+"px"
					});
					dojo.style(this.mainContainer, {
						'right': (width+8)+"px"
					});

					dojo.style(this.splitNode,{
						'right':width+'px'
					});

				}
				dojo.style(this.rightContainer,"display","block");
				this.state = "big";

			}
			if(this.currentBottomWidget){
				this.currentBottomWidget.resize();
				this.currentBottomWidget.resize();
			}

			for(var i=0;i<this.widgets.length;i++){
				var widget = this.widgets[i];
				try{
					if(widget.resize){
						widget.resize();
					}
				}catch(e){

				}
			}
		},

		//添加那个bottom面板
		createBottomSubscribes:function(){
			for(var i=0;i<this._bottomWidget.length;i++){
				var item = this._bottomWidget[i];
				this.own(topic.subscribe("Chart/"+item.parameters.catalog,lang.hitch(this,lang.partial(this.bottomShow,item))));
			}
		},
		currentBottomCatalog:"",
		bottomShow:function(widget,item){
//			html.setStyle(this.bottomDiv,"display","block"); 
			//查看当前面板状态，开还是关
			if(this.isBottomShow){
			}else{
				this.setBottomBig();
			}

			if(this.currentBottomCatalog==widget.parameters.catalog){
				this.currentBottomWidget.init(item);
				return ;
			}else{
				this.currentBottomCatalog = widget.parameters.catalog;//当前有个打开的了
				if(this.currentBottomWidget){
					this.currentBottomWidget.destroy();
					domConstruct.empty(this.chartContainer);
				}
			}

			var widget2 = widget;
			require([widget.module], lang.hitch(this, function(Module) {
				var widget = new Module({parameters:widget2.parameters} );

				domConstruct.place( widget.domNode, this.chartContainer);

				if (widget.startup) {
					widget.startup();
				}
				if (widget.resize) {
					widget.resize();
				}
				if (widget.init) {
					widget.init(item);
				}

				this.currentBottomWidget = widget;//当前有个打开的了
			}));
		},
		isBottomShow:null,
		changeState:function(){
			if(this.isBottomShow){
				this.setBottomSmall();
			}else{
				this.setBottomBig();

			}
		},
		setBottomBig:function(){
			html.setStyle(this.bottomDiv,"display","block");
			this.doDnimate(this.bottomDiv,{  height: {start: 0, end: 255} },500);
			this.doDnimate(this.bottomDiv, {  opacity: {start: 0, end: 1}  },400);
			this.isBottomShow = true;
		},
		setBottomSmall:function(){
			this.doDnimate(this.bottomDiv,{  height: {start: 255, end: 0} },500);
			this.doDnimate(this.bottomDiv, {  opacity: {start: 1, end: 0}  },400);

			setTimeout(lang.hitch(this,function(){
				html.setStyle(this.bottomDiv,"display","none");
			}),500);
			this.isBottomShow = false;
		},

		bottomClose:function(evt){
			this.setBottomSmall();
		},
		doDnimate:function(domNode,properties,duration){
			fx.animateProperty(
				{
					node: domNode,
					properties:properties,
					duration: duration
				}).play();
		}
	});
});