/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/html",
    "dojo/_base/fx",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!./template/MapGlobeView.html",
    "dojo/topic",
    'dojo/on',
    "dojo/Deferred",
    "dojo/dom-construct",
    "base/Library",
    "dojo/promise/all"
], function (declare,
             lang,
             array,
             html,
             fx,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             template,
             topic,
             on,
             Deferred,

             domConstruct,
             Library,
             all
) {
    return declare("base.map.MapGlobeView", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        map: null,

        currentType: "2d",//默认2维
        type:"2d",//默认2维
        initExtent: null,
        plugins:null,

        View2D:null,
        View3D:null,

        constructor: function (args) {
            declare.safeMixin(this, args);

            this._initVars();
            this._initEvent();
        },
        _initVars:function(){
            this.View2D = null;
            this.View3D = null;

            this._Library = new Library();
            this.currentType = this.parameters.defaultType?this.parameters.defaultType:"2d";//设置当前的视图
            this.type = this.parameters.type;//设置地图的类型，二三维结合的
            this.View2D = this.parameters.View2DModule||"base/map/view/View2D";
            this.View3D = this.parameters.View3DModule||"base/map/view/View3D";

            this.map = {};
            this.map["view2D"] = null;
            this.map["view3D"] = null;

            this.plugins = [];

            this.basemapWidgets = [];
            this.layerWidgets = [];
            this.pluginWidgets = [];


        },
        _initEvent:function(){
            //对外暴露的公共接口
            this.own(topic.subscribe("gis/map/setCenter", lang.hitch(this, this.centerAt)));
            //缩放到某个范围
            this.own(topic.subscribe("gis/map/setExtent", lang.hitch(this, this.setExtent)));
            //恢复全图范围，默认的初始化范围
            this.own(topic.subscribe("gis/map/toInitExtent", lang.hitch(this, this.setToInitExtent)));
            //切换地图视图 2d-3d
            this.own(topic.subscribe("gis/map/changeMapMode", lang.hitch(this, this.changeMapMode)));
        },

        centerAt: function (item) {//定位
            if (item && item.lgtd)topic.publish("gis/map/setCenter" + this.currentType, item);
        },
        setExtent: function (item) {
            if (item && item.xmin)topic.publish("gis/map/setExtent" + this.currentType, item);
        },
        setToInitExtent: function () {
        	
        },
        changeMapMode: function () {
            //切换显示视图 保持视野同步，切换的时候
            if (this.currentType == "2d") {
//                html.setStyle(this.mapNode, "display", "none");
                html.setStyle(this.map3dNode, "display", "block");
                this.map["view3D"].setExtent(this.map["view2D"].getExtent());
                this.currentType = "3d";
            } else {
//                html.setStyle(this.mapNode, "display", "block");
                html.setStyle(this.map3dNode, "display", "none");
                this.currentType = "2d";
//                this.map["view2D"].resize();
                this.map["view2D"].setCenter(this.map["view3D"].getCenter());
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            //去解析页面数据
            this.parseConfig();
        },
        startup:function(){
            this.inherited(arguments);

            //二三维变成可配置的
            require([this.View2D,this.View3D], lang.hitch(this, function(View2D,View3D) {
                this.View2D = View2D;
                this.View3D = View3D;

                var para2d = lang.clone(this.parameters);
                para2d["template"] = this.mapNode;
                this.map["view2D"] = new this.View2D({parameters:para2d});

                html.setStyle(this.map3dNode, "display", "none");

                this.map["view2D"].init(); //二维肯定要初始化
                if (this.type == "3d") {
                    var para3d = lang.clone(this.parameters);
                    para3d["template"] = this.map3dNode;
                    this.map["view3D"] = new this.View3D({parameters:para3d});
                    this.map["view3D"].init();
                    html.setStyle(this.map3dNode, "display", "none");

                    //如果是三维的话，默认加切换的
                    require(['base/map/widgets/MapMode'], lang.hitch(this, function (widgetclass) {
                        var widget = new widgetclass();
                        domConstruct.place(widget.domNode, this.mapContainer);
                    }));
                }

                //加载底图
                this.createBaseMaps();
                //加载业务图层
                this.createLayers();
                //加载插件
                this.createPlugins();

                this.own(on(window, 'resize', lang.hitch(this, this.resize)));
            }));

        },
        createBaseMaps:function(){
        	 this.map["view2D"]["createBaseMaps"](this.basemapWidgets); //二维肯定要初始化
        	 if (this.type == "3d") {
        		 this.map["view3D"]["createBaseMaps"](this.basemapWidgets);  
             }
        },
        createLayers:function(){
        	 this.map["view2D"]["createLayers"](this.layerWidgets); //二维肯定要初始化
        	 if (this.type == "3d") {
        		 this.map["view3D"]["createLayers"](this.layerWidgets);  
             }
        },
        createPlugins: function () {
            var widgets = this._Library.toWidgetArray(this.pluginWidgets);
            this._Library.loadModules(widgets).then(lang.hitch(this, function (modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg = widgets[i];
                    if (Module) {
                        try {
                            var widget = new Module({
                                widget_id: cfg.id,
                                parameters: cfg.parameters,
                                map: this.map["view2D"].map,
                                baseMaps: this.basemapWidgets
                            });

                            domConstruct.place(widget.domNode, this.mapContainer);

                            widget.startup();

                            this.plugins.push(widget);
                        } catch (error) {
                            Logger.error("错误创建插件widget:【" + cfg.id + "】," + error) ;
                        }
                    }
                }
            }), lang.hitch(this, function (err) {
                var errors = [err];
                Logger.error(errors);
            }));

        },
        resize: function () {
            try{
                this.map["view2D"].resize();
                if (this.map["view3D"]) {
                    this.map["view3D"].resize();
                }

                if (this.plugins) {
                    for (var i = 0; i < this.plugins.length; i++) {
                        if(this.plugins[i].resize){
                            this.plugins[i].resize();
                        }
                    }
                }
            }catch(e){

            }

        },

        ///都自己去获取就得了
        parseConfig: function () {
            //获取左侧的panel

            var list = window.currentPageWidgets;
            var containerId = this.widget_id;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (item.container == containerId && item.parameters.region == "basemap") {
                    this.basemapWidgets.push(item.parameters);
                }
                if (item.container == containerId && item.parameters.region == "layer") {
                    this.layerWidgets.push(item);
                }
                if (item.container == containerId && item.parameters.region == "plugin") {
                    this.pluginWidgets.push(item);
                }
            }
        },

        destroy: function () {
            if (this.plugins) {
                for (var i = 0; i < this.plugins.length; i++) {
                    try {
                        this.plugins[i].destroy();
                    } catch (e) {
                    }

                    this.plugins[i] = null;
                }
                this.plugins = null;
            }

            this.map["view2D"].destroy();
            if (this.map["view3D"]) {
                this.map["view3D"].destroy();
            }

            this.inherited(arguments);
        },
        doDnimate: function (domNode, properties, duration) {
            fx.animateProperty(
                {
                    node: domNode,
                    properties: properties,
                    duration: duration
                }).play();
        }
    });
});