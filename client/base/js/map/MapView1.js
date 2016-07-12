/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/html",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!./template/MapView1.html",
    "dojo/topic",
    'dojo/on',
    "dojo/Deferred",
    "dojo/query",
    "dojo/dom-construct",

    'esri/config',
    "esri/map",
    "esri/graphic",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/symbols/PictureMarkerSymbol",
    'esri/geometry/Point',
    'esri/geometry/Extent',

    "base/map/exlayers/VideoGraphicsLayer",
    "base/map/exlayers/AlertPointsLayer",
    "base/Library",
    "base/map/utils/MapUtil"


], function (declare,
             lang,
             array,
             html,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             template,
             topic,
             on,
             Deferred,
             query,
             domConstruct,
             esriConfig,
             Map,
             Graphic,
             ArcGISTiledMapServiceLayer,
             PictureMarkerSymbol,
             Point,
             Extent,

             VideoGraphicsLayer,
             AlertPointsLayer,
             Library,
             MapUtil

) {
    return declare("base.map.MapView", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        map: null,

        type: "2d",
        initExtent: null,
        handlers:[],

        basemaps:null,
        layers:null,
        plugins:null,

        constructor: function (args) {
            declare.safeMixin(this, args);

            this._initVars();
            this._initEvent();
        },
        //初始化变量
        _initVars:function(){
            this._Library = new Library();
            this.handlers = [];

            //子widget真正的实例化之后的结果
            this.basemaps = [];
            this.layers = [];
            this.plugins = [];

            //设置代理
            esriConfig.defaults.io.alwaysUseProxy = false;
            esriConfig.defaults.io.proxyRules = [];
 
            esriConfig.defaults.io.proxyUrl = APP_ROOT+"base/js/map/proxy/proxy.jsp"; 
        },
        _initEvent:function(){
            //对外暴露的公共接口
            this.own(topic.subscribe("gis/map/setCenter", lang.hitch(this, this.centerAt)));
            //缩放到某个范围
            this.own(topic.subscribe("gis/map/setExtent", lang.hitch(this, this.setExtent)));
            //恢复全图范围，默认的初始化范围
            this.own(topic.subscribe("gis/map/toInitExtent", lang.hitch(this, this.setToInitExtent)));

            //监听resize
            this.own(on(window, 'resize', lang.hitch(this, this.resize)));
        },
        //////////////////////////////////////////////
        centerAt: function (item) {
            if (this.parameters.type == "2d") {
                var pt = new Point(Number(item.lgtd), Number(item.lttd));
                var self = this;
                this.map.centerAt(pt).then(function () {
                    self.alertLayer.getData({lgtd: pt.x, lttd: pt.y});
                });
            } else {
                this.map.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(Number(item.lgtd), Number(item.lttd), 15000.0)
                });
            }
        },
        setExtent: function (item) {
            if (this.parameters.type == "2d") {
                this.map.setExtent(new Extent(Number(item.xmin), Number(item.ymin), Number(item.xmax), Number(item.ymax)).expand(1.1));
            } else {
                var rectangle = Cesium.Rectangle.fromDegrees(item.xmin, item.ymin, item.xmax, item.ymax);
                this.map.camera.flyTo({
                    destination : rectangle
                });
            }
        },
        setToInitExtent: function () {
        },
        mapClick: function (evt) {
            //这个给测量的派发个事件
            topic.publish("base/map/widgets/MapBaseTool", evt);

            if (evt.graphic == null) {
                topic.publish("base/layout/floatLayout/panelBottomContainer/close");
                this.map.infoWindow.hide();
            }
        },

        //////////////////////////////////////////////
        postCreate: function () {
            this.inherited(arguments);

            //去解析页面数据
            this.parseConfig();
        },

        _visitConfigMapLayers: function (basemaps, cb) {
            array.forEach(basemaps, function (layerConfig, i) {
                layerConfig.isOperationalLayer = false;
                cb(layerConfig, i);
            }, this);
        },

        createLayers: function (layers) {

            if (!layers)return;

            var widgets = this._Library.toWidgetArray(layers);
            this._Library.loadModules(widgets).then(lang.hitch(this, function (modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg = widgets[i];
                    if (Module) {
                        try {
                            var layer = new Module({widget_id: cfg.id, parameters: cfg.parameters});
                            this.map.addLayer(layer);
                            this.layers.push(layer);
                        } catch (error) {
                            Logger.error("业务图层创建报错:"+cfg);
                            Logger.error("报错信息:"+error);
                        }
                    }
                }
            }), lang.hitch(this, function (err) {
                var errors = [err];
                Logger.error("业务图层加载报错:"+errors);
            }));
        },
        resize: function () {
            //console.log("刷新子布局");
            if (this.plugins) {
                for (var i = 0; i < this.plugins.length; i++) {
                    if(this.plugins[i].resize){
                        this.plugins[i].resize();
                    }
                }
            }

            this.map.resize();
            this.map.reposition();
        }
        ///都自己去获取就得了
        ,
        parseConfig: function () {
            //获取左侧的panel
            this.basemapWidgets = [];
            this.layerWidgets = [];
            this.pluginWidgets = [];

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
        createPlugins: function (pluginWidgets) {
            var widgets = this._Library.toWidgetArray(pluginWidgets);
            Logger.time("createMapPlugins");
            this._Library.loadModules(widgets).then(lang.hitch(this, function (modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg = widgets[i];
                    if (Module) {
                        try {
                            var widget = new Module({
                                widget_id: cfg.id,
                                parameters: cfg.parameters,
                                map: this.map,
                                baseMaps: this.basemapWidgets
                            });

                            domConstruct.place(widget.domNode, this.mapContainer);

                            widget.startup();

                            this.plugins.push(widget);
                        } catch (error) {
                            Logger.error("错误创建widget:【" + cfg.id + "】," + error) ;
                        }
                    }
                }
                Logger.timeEnd("createMapPlugins");
            }), lang.hitch(this, function (err) {
                var errors = [err];
                Logger.error(errors);
            }));
        },

        destroy: function () {
            if (this.layers) {
                for (var i = 0; i < this.layers.length; i++) {
                    try {
                        this.layers[i].destroy();
                    } catch (e) {
                    }

                    this.map.removeLayer(this.layers[i]);
                }
                this.layers = null;
            }
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
            //移除监听
            var list = this.handlers;
            for (var i = 0, max = list.length; i < max; i++) {
                var item = list[i];
                item.remove();
            }

            if(this.map.destroy){
                this.map.destroy();
            }

            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);

            if (this.parameters.type == "2d") {
                this.map = new Map(this.mapNode,
                    {
                        'logo': false,
                        'zoom': this.parameters.defaultZoom,
                        'center': [Number(this.parameters.lgtd), Number(this.parameters.lttd)]
                    });

                window.viewerMap = this.map;//初始化到全局

                //根据配置，创建底图图层
                if (this.basemapWidgets.length>0) {
                    this._visitConfigMapLayers(this.basemapWidgets, lang.hitch(this, function (layerConfig) {
                        MapUtil.createLayer2(this.map, '2D', layerConfig);
                    }));
                } else {
                    var tiled = new ArcGISTiledMapServiceLayer(this.parameters.tileServerURL?this.parameters.tileServerURL:'http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer');
                    this.map.addLayer(tiled);
                }
                //添加定位图层
                this.alertLayer = new AlertPointsLayer();
                this.map.addLayer(this.alertLayer);

                //根据配置，创建业务图层
                this.createLayers(this.layerWidgets);

                this.handlers.push(this.map.on("click", lang.hitch(this, this.mapClick))); //监听住click事件

                setTimeout(lang.hitch(this, function () {
                    //根据配置，创建插件
                    this.createPlugins(this.pluginWidgets);
                }), 500);
                //更改下infowindow的弹出框样式
                setTimeout(lang.hitch(this, function () {
                    var ss = query(".esriPopup", dojo.byId("map_root"));
                    html.setStyle(ss[0], "z-index", 2000);
                }), 3000);

            } else {
                var esri = new Cesium.ArcGisMapServerImageryProvider({
                    url: this.parameters.tileServerURL?this.parameters.tileServerURL:'//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
                });
                this.map = new Cesium.Viewer(this.mapNode, {
                    imageryProvider: esri,
                    baseLayerPicker: false,
                    timeline: false,//
                    animation: false,//
                    navigationHelpButton: false
                });

                setTimeout(lang.hitch(this, function () {
                    this.map.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(Number(this.parameters.lgtd), Number(this.parameters.lttd), 25000.0),
                        orientation: {
                            heading: Cesium.Math.toRadians(0.0),
                            pitch: Cesium.Math.toRadians(-15.0),
                            roll: 0.0
                        }
                    });

                    var layer = new VideoGraphicsLayer();
                    layer.map = this.map;

                }), 1000);
            }
        }

    });
});