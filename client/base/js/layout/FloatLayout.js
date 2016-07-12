define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/_base/html",
    "dojo/dom",
    "dojo/_base/xhr",
    "dojo/topic",
    
    "dojo/text!./template/FloatLayout.html",
    "dojo/text!./css/FloatLayout.css",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dojo/parser",
    "dojo/ready",
    "base/Library",
    "dojo/Deferred",
    'dojo/_base/fx',
    'base/layout/panel/TabPanel1',
    'base/layout/panel/FloatPanel',
    "dojo/on",
    "rdijit/utils",
    'dojo/query',
    "base/utils/commonUtils"

], function(declare,
    lang,
    array,
    domConstruct,
    domStyle,
    domClass,
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
    Deferred,
    fx,
    TabPanel,
    FloatPanel,
    on,
    utils,
    query,
    commonUtils
    ) {

    return declare("base.layout.FloatLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        'baseClass': "base-layout-floatlayout",
        templateString: template,
        _library: null,
       
        //  panelWidgets:null,
        constructor: function(args) {
            lang.mixin(this, args);

            this.setCss(css);

            this._library = new Library();

            this.mainWidget = {};
            this._mainWidget = null;

            this.itemList = [];

            this.floatPanelList = [];
            this.panelWidgets = [];
            this.taskWidgets = [];
            this._bottomWidget = [];
            
            this.initEvent();
        },
        initEvent:function(){
        	this.own(topic.subscribe("base/layout/floatLayout/panelBottomContainer/size",lang.hitch(this,this.panelBottomContainerSize)));
        	this.own(topic.subscribe("base/layout/floatLayout/panelBottomContainer/close",lang.hitch(this,this.bottomClose)));
        },
        
        placeAt: function(divId) {
            var main = dojo.byId(divId);
            domConstruct.place(this.domNode, main);

        },
        postCreate: function() {
            this.inherited(arguments);
        },
        startup: function() {
            this.inherited(arguments);

            //Logger.log(this.id);

            //看看是否要创建panel，观察里面有没有需要默认打开的
            this.getWidgetx();
            //去全局的widget里面获取
            this.createPanelWidget(this.panelWidgets);
            //看看是否需要默认打开某个面板
            this.createTaskWidget(this.taskWidgets);

            this.createPanelIcons();
            this.createTaskIcons();

            this.createMainView();

            this.createBottomSubscribes();
        },
        getWidgetx: function() {
            //获取左侧的panel
            var list = window.currentPageWidgets;
            var containerId = this.widget_id;


            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (item.container == containerId && item.parameters.region == "panel") {
                    this.panelWidgets.push(item);
                }
                if (item.container == containerId && item.parameters.region == "task") {
                    this.taskWidgets.push(item);
                }
                if (item.container == containerId && item.parameters.region == "view") {
                    this.mainWidget = item;
                }
                if (item.container == containerId && item.parameters.region == "bottom") {
					this._bottomWidget.push(item);
				} 
            }

        },

        //因为其他的面板都是异步加载的，所以现在略微不同
        addChild: function(widget) {
            switch (widget.parameters.region) {
                case "view":
                    domConstruct.place(widget.domNode, this.mapNode);
                    if (widget.resize) {
                        widget.resize();
                    }
                    break;
                default:
                    break;

            }
        },
        createMainView: function() {
            this._library.loadModule1(this.mainWidget.module).then(dojo.hitch(this, function(Module) {

                try {
                    var widget = new Module({
                        widget_id: this.mainWidget.id,
                        style: "width:100%;height:100%",
                        parameters: this.mainWidget.parameters
                    });
                    if (widget.startup) {
                        widget.startup();
                    }
                    domConstruct.place(widget.domNode, this.mapNode);
                    if (widget.resize) {
                        widget.resize();
                    }
                    
                    this._mainWidget = widget;

                } catch (error) {
                    throw "Error create instance:" + this.mainWidget.id + ". " + error;
                }

            }));
        },
        removeChild: function(widget) {
            widget.destroy();
            //domConstruct.destroy(widget.domNode);
        },
        resize: function() {

        },
     
        createPanelIcons: function() {
            for (var i = 0; i < this.panelWidgets.length; i++) {
                var item = this.panelWidgets[i];
                var itemDiv = domConstruct.create("div", {
                    id: item.id
                });
                domClass.add(itemDiv, "iconItem");
                domConstruct.place(itemDiv, this.icons_panel);

                var imgNode = html.create('img', {
                    id: item.id,
                    src: item.parameters.icon || item.parameters.darkIcon || tem.parameters.greyIcon,
                    style: {
                        width: '32px',
                        height: '32px'
                    }
                }, itemDiv);

                var label = html.create('div', {
                    id: item.id,
                    'class': 'content-title333',
                    innerHTML: item.parameters.i18nLabel
                }, itemDiv);


                this.own(on(itemDiv, 'click', lang.hitch(this, function(evt) {
                    var widgetid = evt.target.id;
                    for (var i = 0; i < this.panelWidgets.length; i++) {
                        if (widgetid == this.panelWidgets[i].id) {
                            this.setSelectWidget(this.panelWidgets[i]);
                            topic.publish("base/layout/tabPanel/openSelectTab", this.panelWidgets[i]);
                            break;
                        }
                    }
                })));

                this.itemList.push({
                    id: item.id,
                    div: itemDiv,
                    image: imgNode,
                    widget: item
                });

            }
            if(commonUtils.isMobile()){
            	//默认不打开
            	setTimeout(lang.hitch(this,function(){
                 	if(this.panelWidgets&&this.panelWidgets.length>0){
                 		//默认第一个打开
                    	    this.setSelectWidget(this.panelWidgets[0]);
                         topic.publish("base/layout/tabPanel/openSelectTab", this.panelWidgets[0]);
                 	}
                 	setTimeout(lang.hitch(this,function(){
                		
                		topic.publish("base/layout/tabPanel/hideTab");
                	}),500);
                 }),2000);
            	
            }else{
            	 setTimeout(lang.hitch(this,function(){
                 	if(this.panelWidgets&&this.panelWidgets.length>0){
                 		//默认第一个打开
                    	    this.setSelectWidget(this.panelWidgets[0]);
                         topic.publish("base/layout/tabPanel/openSelectTab", this.panelWidgets[0]);
                 	}
                 	
                 }),2000);
            }
           
        },
        itemList: null,
        createTaskIcons: function() {
            for (var i = 0; i < this.taskWidgets.length; i++) {
                var item = this.taskWidgets[i];
                //
                var itemDiv = domConstruct.create("div", {
                    id: item.id
                });
                domClass.add(itemDiv, "iconItem");
                domConstruct.place(itemDiv, this.icons_task);

                var imgNode = html.create('img', {
                    id: item.id,
                    src: item.parameters.darkIcon
                }, itemDiv);

                var label = html.create('div', {
                    id: item.id,
                    innerHTML: item.parameters.i18nLabel
                }, itemDiv);

                this.own(on(itemDiv, 'click', lang.hitch(this, function(evt) {
                    var widgetid = evt.target.id;
                    for (var i = 0; i < this.taskWidgets.length; i++) {
                        if (widgetid == this.taskWidgets[i].id) {
                            this.setSelectWidget(this.taskWidgets[i]);
                            this.createFloatPanel(this.taskWidgets[i]);
                            break;
                        }
                    }
                })));

                this.itemList.push({
                    id: item.id,
                    div: itemDiv,
                    image: imgNode,
                    widget: item
                });
            }
        },
        fixPositon: function(position) {
            var left = 0;
            var top = 0;
            var right = 0;
            var bottom = 0;
            var w;
            var h;
            if (position.width) {}
            if (position.height) {}
            if (!position.left) {
                position.left = (this.Container.clientWidth - (Number(position.width.replace("px", "")) + Number(position.right.replace("px", "")))) + "px";
            }
            if (!position.right) {
                position.right = (this.Container.clientWidth - (Number(position.width.replace("px", "")) + Number(position.left.replace("px", "")))) + "px";
            }
            if (!position.top) {
                position.top = (this.Container.clientHeight - (Number(position.height.replace("px", "")) + Number(position.bottom.replace("px", "")))) + "px";
            }
            if (!position.bottom) {
                position.bottom = (this.Container.clientHeight - (Number(position.height.replace("px", "")) + Number(position.top.replace("px", "")))) + "px";
            }
        },
        floatPanelList: null,
        createFloatPanel: function(widget) {

            var isHas = false;
            var panel = null;
            //判断是否差创建过
            for (var i = 0; i < this.floatPanelList.length; i++) {
                if (this.floatPanelList[i].id == widget.id) {
                    isHas = true;
                    panel = this.floatPanelList[i].panel;
                    break;
                }
            }

            if (isHas) { //如果有了直接显示出来
                html.setStyle(panel.domNode, 'display', 'block');
                html.setStyle(panel.domNode, 'opacity', '1');

            } else {
                //没有的话，创建出来
                this.fixPositon(widget.parameters.position);
                panel = new FloatPanel({
                    position: widget.parameters.position,
                    title: widget.parameters.i18nLabel
                });
                panel.startup();


                this.floatPanelList.push({
                    id: widget.id,
                    panel: panel
                });

                //加到Container上边
                html.setStyle(panel.domNode, utils.getPositionStyle(widget.parameters.position));
                html.setStyle(panel.domNode, 'position', 'absolute');

                domConstruct.place(panel.domNode, this.Container);

                var widgets = this._library.toWidgetArray(widget);
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
                                panel.addWidget(widget.domNode);
                                if (widget.startup) {
                                    widget.startup();
                                }
                                if (widget.resize) {
                                    widget.resize();
                                }
                            } catch (error) {
                                throw "Error create instance:" + cfg.id + ". " + error;
                            }
                        }
                    }
                }), lang.hitch(this, function(err) {
                    var errors = [err];
                    Logger.error(errors);
                }));
                //
                //this._library.loadWidget(widget.pathName, widget.pathLocation, widget.module).then(lang.hitch(this, function (WidgetModule) {
                //
                //        var widget = new WidgetModule({
                //            parameters: widget
                //        });
                //        //domConstruct.place(widget.domNode, this.Container);
                //        panel.addWidget(widget.domNode);
                //        if (widget.startup) {
                //            widget.startup();
                //        }
                //        if (widget.resize) {
                //            widget.resize();
                //        }
                //    }),
                //    lang.hitch(this, function (error) {
                //        Logger.log(error);
                //    })
                //);

            }
        },
        setSelectWidget: function(widget) {
            for (var i = 0; i < this.itemList.length; i++) {
                if (widget.id == this.itemList[i].id) {
                    this.itemList[i].image.src = this.itemList[i].widget.parameters.selectedIcon;
                } else {
                    this.itemList[i].image.src = this.itemList[i].widget.parameters.darkIcon||this.itemList[i].widget.parameters.icon;
                }
            }
        },

        createPanelWidget: function(panelWidgets) {
            if (panelWidgets.length > 0) {
                //查创建container
                var panel = new TabPanel();
                panel.startup();

                domConstruct.place(panel.domNode, this.panelContainer);
            }
        },
        createTaskWidget: function(taskWidgets) {
            for (var i = 0; i < taskWidgets.length; i++) {

                //看有没有要打开的面板
            }
        },
        panelWidgets: [],
        taskWidgets: [],
        mainWidget: null,
        _mainWidget: null,
        addWidget: function(widget, extentionpoint) {
            widget.id = dojox.uuid.generateRandomUuid();
            widget.module = widget.moduleName;
            widget.name = widget.view_name;
            widget.extension_id = extentionpoint;

            if (extentionpoint == "View") {
                this.mainWidget = widget;
            } else if (extentionpoint == "Panel") {
                this.panelWidgets.push(widget);
            } else {
                this.taskWidgets.push(widget);
            }
        },

        createWidgets: function() {
            array.forEach(this.widgets, lang.hitch(this, this.addView));
        },
        addView: function(widgetConfig) {
            widgetConfig.path = {};

            if (widgetConfig.pathName && widgetConfig.pathLocation) {
                widgetConfig.path[widgetConfig.pathName] = widgetConfig.pathLocation;
            } else {
                var pathIdx = widgetConfig.module.indexOf('/');
                var pathName = widgetConfig.module.substr(0, pathIdx);
                //lookup in dojo config
                var dojoConfigPkgList = dojoConfig.packages;
                for (var idx = 0; idx < dojoConfigPkgList.length; idx++) {
                    if (dojoConfigPkgList[idx].name === pathName) {
                        pathLocation = dojoConfigPkgList[idx].location;
                        widgetConfig.path[pathName] = pathLocation;
                        widgetConfig.pathName = pathName;
                        widgetConfig.pathLocation = pathLocation;
                    }
                }
            }
            this._library.loadWidget(widgetConfig.pathName, widgetConfig.pathLocation, widgetConfig.module).then(lang.hitch(this, function(WidgetModule) {

                    //try{
                    var widget = new WidgetModule({
                        parameters: widgetConfig
                    });
                    if (widgetConfig.view == "float") {
                        //根据positon判断位置

                        var widgetDiv = html.create('div', {
                            'class': 'float-widget',
                            'innerHTML': ''

                        }, this.floatContainer);

                        domConstruct.place(widget.domNode, widgetDiv);

                    }
                    if (widgetConfig.view == "main") {
                        domConstruct.place(widget.domNode, this.mainContainer);
                    }

                    if (widgetConfig.type && widgetConfig.type == "chart") {
                        widget.createFirst("contentViewTab-Chart");
                    }
                    if (widget.resize) {
                        widget.resize();
                    }
                    //}catch(e){
                    //  //this._library.publishMessage("CIYUI0003E", i18nRes.CIYUI0003E);
                    //  Logger.log(e);
                    //}
                }),
                lang.hitch(this, function(error) {
                    //this._library.publishMessage("CIYUI0003E", i18nRes.CIYUI0003E);
                    Logger.log("002");
                })
            );
        },
        //
     
        changeState: function(evt) {
            //iconsDivNode隐藏
            if (this.iconsDivNode.style.display == "block") {
                html.setStyle(this.iconsDivNode, 'display', 'none');
                html.setStyle(this.bottomNode, 'right', null);
                html.setStyle(this.bottomNode, 'opacity', '0.7');
                html.setStyle(this.bottomNode, 'height', '55px');


                html.setStyle(this.bottomIconNode, 'margin', '10px');
                html.setStyle(this.bottomIconNode, 'margin-left', '5px');

            } else {
                html.setStyle(this.iconsDivNode, 'display', 'block');
                html.setStyle(this.bottomNode, 'right', '3px');
                html.setStyle(this.bottomNode, 'opacity', '1');

                html.setStyle(this.bottomNode, 'height', '65px');


                html.setStyle(this.bottomIconNode, 'margin', '15px');
                html.setStyle(this.bottomIconNode, 'margin-left', '5px');
            }


        },
         
        panelBottomContainerSize: function(args) {
            html.setStyle(this.bottomDiv, 'left', args.left + "px");

            if(this.currentBottomWidget){
            	this.currentBottomWidget.resize(); 
            	this.currentBottomWidget.resize(); 
//            	setTimeout(lang.hitch(this,function(){
//            		this.currentBottomWidget.resize(); 
//            	}),500);
				
			}
        },
        getConfig: function(widget /*object*/ ) {
            var cfg = null;
            if (this.isInstance(widget)) {
                cfg = widget["#cfg"]
            } else {
                cfg = widget;
            }
            if (cfg && !cfg.parameters) {
                cfg.parameters = {};
            }
            return cfg;
        },
        isInstance: function(widget /*object*/ ) {
            if (widget.constructor == Object && typeof widget["#cfg"] == "undefined") {
                return false;
            } else {
                return true;
            }
        },
        toWidgetArray: function(widget /*object, array*/ ) {
            var widgets = [];
            if (lang.isArray(widget)) {
                widgets = widget;
            } else {
                widgets = [widget];
            }
            return widgets;
        },
        destroy: function() {
            //          this.inherited(arguments);
            this.mainWidget = {};

            this.itemList = [];
            this.panelWidgets = [];
            this.floatPanelList = [];
            this.panelBottomContainerWidget = null;
            // for(var p in this){
            //     if(this.hasOwnProperty(p)){
            //         Logger.log(p);
            //         delete this[p];
            //     }
            // }
            // this.destroyRecursive();
            if(this._mainWidget){
            	try{
            		this._mainWidget.destroy();
            	}catch(e){
            		Logger.log(e);
            	}
            	
            	  
            }
            
        },
        loadModules: function(widgets /*array*/ ) {
            var deferred = new Deferred();
            //detect which module need be loaded
            var ids = [];
            var modules = [];
            for (var i = 0; i < widgets.length; i++) {
                if (!this.isInstance(widgets[i])) {
                    ids.push(i);
                    modules.push(widgets[i].module);
                }
            }
            //start load modules
            var handler = require.on("error", function(err) {
                var error = "Error loading module:" + error.info;
                handler.remove();
                deferred.reject(error);
            })

            require(modules, function() {
                var result = [];
                result.length = widgets.length;
                for (var i = 0; i < arguments.length; i++) {
                    var Module = arguments[i];
                    result[ids[i]] = Module;
                }
                try {
                    deferred.resolve(result);
                } catch (error) {
                    deferred.reject(error);
                }
            })

            return deferred;
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
		bottomHeight:255,
		setBottomBig:function(){
			html.setStyle(this.bottomDiv,"display","block");
			this.doDnimate(this.bottomDiv,{  height: {start: 0, end: this.bottomHeight} },500);
	        this.doDnimate(this.bottomDiv, {  opacity: {start: 0, end: 1}  },400);
			this.isBottomShow = true;
		},
		setBottomSmall:function(){
			this.doDnimate(this.bottomDiv,{  height: {start: this.bottomHeight, end: 0} },500);
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
